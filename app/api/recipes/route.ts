import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === "generate-options-dish") {
      return await generateOptionsForDish(body);
    } else if (body.action === "generate-recipe-dish") {
      return await generateRecipeForDishStreaming(body);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Recipe API error:", err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Recipe generation failed: ${message}` },
      { status: 500 }
    );
  }
}

interface DishInput {
  title: string;
  type?: string;
  servings: number;
  attributes?: string[];
}

interface UserInput {
  name: string;
  dietaryRestrictions?: string[];
  dietaryNote?: string;
}

function formatDietaryContext(users: UserInput[]): string {
  const lines = users
    .filter((u) => u.dietaryRestrictions?.length || u.dietaryNote)
    .map((u) => {
      const parts: string[] = [];
      if (u.dietaryRestrictions?.length)
        parts.push(u.dietaryRestrictions.join(", "));
      if (u.dietaryNote) parts.push(u.dietaryNote);
      return `${u.name}: ${parts.join(" — ")}`;
    });
  return lines.length ? lines.join("\n") : "No specific dietary restrictions.";
}

async function generateOptionsForDish(body: {
  dish: DishInput;
  users: UserInput[];
}) {
  const { dish, users } = body;

  const dietaryContext = formatDietaryContext(users);

  const dishLine = `"${dish.title}" (category: ${dish.type || "unspecified"}, serves ${dish.servings}${dish.attributes?.length ? `, dietary: ${dish.attributes.join(", ")}` : ""})`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a friendly potluck cooking assistant. Generate 3 recipe variations for the following dish.

Provide exactly 3 options in order:
1. "Quick & Easy" — minimal prep, budget-friendly
2. "Balanced" — moderate effort, reliable crowd-pleaser
3. "Impressive" — more effort, standout quality

Dish:
- ${dishLine}

Group dietary info:
${dietaryContext}

IMPORTANT:
- Each recipe MUST respect the dish's dietary attributes (e.g. if marked vegetarian, all 3 options must be vegetarian)
- Cost estimates should be realistic US averages for a midsize-to-large city
- prepTime is total time including prep and cooking

Return valid JSON matching this schema:
{
  "options": [
    { "name": "Specific Recipe Name", "prepTime": "20 min", "cost": 12.50, "description": "One appetizing sentence." },
    { "name": "Another Recipe", "prepTime": "35 min", "cost": 18.00, "description": "One appetizing sentence." },
    { "name": "Fancy Recipe", "prepTime": "50 min", "cost": 28.00, "description": "One appetizing sentence." }
  ]
}`,
      },
      // Prefill forces the model to start with "{", avoiding markdown fences
      { role: "assistant", content: "{" },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  const json = JSON.parse("{" + text);

  return NextResponse.json(json);
}

/**
 * Stream a single dish's recipe + per-dish shopping items (aisle-tagged).
 * Streaming keeps the connection alive past Vercel's 10s default.
 * Client aggregates shopping items across dishes.
 */
async function generateRecipeForDishStreaming(body: {
  dishTitle: string;
  recipeName: string;
  servings: number;
  dietaryAttributes?: string[];
  users?: UserInput[];
}) {
  const { dishTitle, recipeName, servings, dietaryAttributes, users } = body;

  const dietaryContext = users ? formatDietaryContext(users) : "";
  const dishConstraints = dietaryAttributes?.length
    ? `\nDietary constraints for this dish: ${dietaryAttributes.join(", ")}`
    : "";

  const stream = client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are a friendly potluck cooking assistant. Generate a detailed recipe and aisle-tagged shopping items for ONE dish.

Recipe: "${recipeName}" for the dish "${dishTitle}" (serves ${servings})${dishConstraints}

${dietaryContext ? `Group dietary info:\n${dietaryContext}\n` : ""}
Provide:
- Full ingredient list with precise quantities (scaled to the serving count)
- Clear, numbered step-by-step instructions (keep each step to 1-2 sentences)
- One helpful tip
- Shopping items mirroring the ingredient list, each tagged with a grocery aisle (e.g. "Produce", "Dairy & Eggs", "Meat & Seafood", "Pantry", "Bakery", "Frozen", "Spices & Seasonings", "Other")

Return valid JSON matching this schema:
{
  "recipe": {
    "dishTitle": "${dishTitle}",
    "recipeName": "${recipeName}",
    "servings": ${servings},
    "prepTime": "30 min",
    "ingredients": [
      { "item": "orzo pasta", "quantity": "1 lb" }
    ],
    "steps": ["Step 1 instruction...", "Step 2 instruction..."],
    "tips": "A helpful cooking tip"
  },
  "shoppingItems": [
    { "item": "orzo pasta", "quantity": "1 lb", "aisle": "Pantry" }
  ]
}`,
      },
      // Prefill forces the model to start with "{", avoiding markdown fences
      { role: "assistant", content: "{" },
    ],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode("{"));
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        controller.enqueue(encoder.encode(`\n__ERROR__:${msg}`));
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
