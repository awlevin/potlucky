import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

/** Extract the first JSON object from a model response, ignoring markdown fences or preamble text. */
function extractJSON(text: string): unknown {
  // Try direct parse first
  try {
    return JSON.parse(text.trim());
  } catch {
    // Fall through
  }
  // Find the first { and last } to extract the JSON object
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
      return await generateRecipes(body);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("Recipe API error:", err);
    return NextResponse.json(
      { error: "Failed to generate recipes. Please try again." },
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

async function generateRecipes(body: {
  selections: { dishTitle: string; recipeName: string; servings: number }[];
}) {
  const { selections } = body;

  const selectionList = selections
    .map(
      (s) =>
        `- "${s.recipeName}" for the dish "${s.dishTitle}" (serves ${s.servings})`
    )
    .join("\n");

  const message = await client.messages.create({
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

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  const json = extractJSON(text);

  return NextResponse.json(json);
}
