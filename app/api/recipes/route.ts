import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

/** Extract the first JSON object from a string, ignoring markdown fences or preamble. */
function extractJSON(text: string): unknown {
  try {
    return JSON.parse(text.trim());
  } catch {
    // Fall through
  }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error(`No JSON object found in response: ${text.slice(0, 200)}`);
  }
  return JSON.parse(text.slice(start, end + 1));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === "generate-options") {
      return await generateOptions(body);
    } else if (body.action === "generate-recipes") {
      return await generateRecipesStreaming(body);
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

async function generateOptions(body: {
  dishes: DishInput[];
  users: UserInput[];
}) {
  const { dishes, users } = body;

  const dietaryContext = users
    .filter((u) => u.dietaryRestrictions?.length || u.dietaryNote)
    .map((u) => {
      const parts: string[] = [];
      if (u.dietaryRestrictions?.length)
        parts.push(u.dietaryRestrictions.join(", "));
      if (u.dietaryNote) parts.push(u.dietaryNote);
      return `${u.name}: ${parts.join(" — ")}`;
    })
    .join("\n");

  const dishList = dishes
    .map(
      (d) =>
        `- "${d.title}" (category: ${d.type || "unspecified"}, serves ${d.servings}${d.attributes?.length ? `, dietary: ${d.attributes.join(", ")}` : ""})`
    )
    .join("\n");

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are a friendly potluck cooking assistant. Generate 3 recipe variations for each dish below.

For each dish provide exactly 3 options:
1. "Quick & Easy" — minimal prep, budget-friendly
2. "Balanced" — moderate effort, reliable crowd-pleaser
3. "Impressive" — more effort, standout quality

Dishes:
${dishList}

Group dietary info:
${dietaryContext || "No specific dietary restrictions."}

IMPORTANT:
- Each recipe MUST respect the dish's dietary attributes (e.g. if marked vegetarian, all 3 options must be vegetarian)
- Cost estimates should be realistic US averages for a midsize-to-large city
- prepTime is total time including prep and cooking

Return ONLY valid JSON with no markdown formatting:
{
  "dishes": [
    {
      "originalTitle": "exact title from above",
      "options": [
        { "name": "Specific Recipe Name", "prepTime": "20 min", "cost": 12.50, "description": "One appetizing sentence." },
        { "name": "Another Recipe", "prepTime": "35 min", "cost": 18.00, "description": "One appetizing sentence." },
        { "name": "Fancy Recipe", "prepTime": "50 min", "cost": 28.00, "description": "One appetizing sentence." }
      ]
    }
  ]
}`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  const json = extractJSON(text);

  return NextResponse.json(json);
}

/**
 * Stream recipe generation to avoid Vercel's 10s function timeout.
 * Tokens are forwarded as they arrive, keeping the connection alive.
 * Client accumulates the full text and parses JSON when the stream ends.
 */
async function generateRecipesStreaming(body: {
  selections: { dishTitle: string; recipeName: string; servings: number }[];
}) {
  const { selections } = body;

  const selectionList = selections
    .map(
      (s) =>
        `- "${s.recipeName}" for the dish "${s.dishTitle}" (serves ${s.servings})`
    )
    .join("\n");

  const stream = client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8192,
    messages: [
      {
        role: "user",
        content: `You are a friendly potluck cooking assistant. Generate detailed recipes and a consolidated shopping list.

Selected recipes:
${selectionList}

For each recipe provide:
- Full ingredient list with precise quantities (scaled to the serving count)
- Clear, numbered step-by-step instructions
- One helpful tip

Then consolidate ALL ingredients across all recipes into a single shopping list:
- Group by grocery store aisle (e.g. "Produce", "Dairy & Eggs", "Meat & Seafood", "Pantry", "Bakery", "Frozen", "Spices & Seasonings", "Other")
- Merge duplicate ingredients across recipes and combine their quantities
- Use common grocery store section names

Return ONLY valid JSON with no markdown formatting:
{
  "recipes": [
    {
      "dishTitle": "original dish title",
      "recipeName": "recipe name",
      "servings": 8,
      "prepTime": "30 min",
      "ingredients": [
        { "item": "orzo pasta", "quantity": "1 lb" }
      ],
      "steps": ["Step 1 instruction...", "Step 2 instruction..."],
      "tips": "A helpful cooking tip"
    }
  ],
  "shoppingList": [
    { "item": "orzo pasta", "quantity": "1 lb", "aisle": "Pantry" }
  ]
}`,
      },
    ],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
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
        // Send error as text so client can detect it
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
