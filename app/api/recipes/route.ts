import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { clientIp, createRateLimiter } from "@/lib/rateLimit";

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

// Each call spends Anthropic credits and the endpoint needs no login, so
// cap requests per client and reject anything that is not shaped like what
// RecipeWizard sends. A full menu (one options call + one recipe call per
// dish, plus retries) fits well inside this budget.
const rateLimit = createRateLimiter({ limit: 40, windowMs: 10 * 60 * 1000 });
const MAX_BODY_BYTES = 32 * 1024;

export async function POST(request: NextRequest) {
  const limited = rateLimit(clientIp(request.headers));
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many recipe requests. Take a breather and try again soon." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Request too large" }, { status: 413 });
    }
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (!isRecord(body)) return badRequest();

    if (body.action === "generate-options-dish") {
      const input = parseOptionsInput(body);
      return input ? await generateOptionsForDish(input) : badRequest();
    } else if (body.action === "generate-recipe-dish") {
      const input = parseRecipeInput(body);
      return input ? await generateRecipeForDishStreaming(input) : badRequest();
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    // Log the details; never echo upstream errors to the client.
    console.error("Recipe API error:", err);
    return NextResponse.json(
      { error: "Recipe generation failed. Please try again." },
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

/* ---------- Input validation ---------- */

const LIMITS = {
  title: 200,
  type: 40,
  tag: 40,
  tags: 10,
  userName: 80,
  dietaryNote: 300,
  users: 100,
  maxServings: 200,
};

function badRequest() {
  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function str(v: unknown, max: number, { required = false } = {}): string | undefined | null {
  if (v === undefined || v === null) return required ? null : undefined;
  if (typeof v !== "string" || v.length > max) return null;
  const trimmed = v.trim();
  if (required && !trimmed) return null;
  return trimmed;
}

function tags(v: unknown): string[] | undefined | null {
  if (v === undefined || v === null) return undefined;
  if (!Array.isArray(v) || v.length > LIMITS.tags) return null;
  const out: string[] = [];
  for (const t of v) {
    const s = str(t, LIMITS.tag, { required: true });
    if (!s) return null;
    out.push(s);
  }
  return out;
}

function servingsOf(v: unknown): number | null {
  return typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= LIMITS.maxServings
    ? v
    : null;
}

function usersOf(v: unknown): UserInput[] | undefined | null {
  if (v === undefined || v === null) return undefined;
  if (!Array.isArray(v) || v.length > LIMITS.users) return null;
  const out: UserInput[] = [];
  for (const u of v) {
    if (!isRecord(u)) return null;
    const name = str(u.name, LIMITS.userName);
    const dietaryRestrictions = tags(u.dietaryRestrictions);
    const dietaryNote = str(u.dietaryNote, LIMITS.dietaryNote);
    if (name === null || dietaryRestrictions === null || dietaryNote === null) return null;
    out.push({ name: name ?? "", dietaryRestrictions, dietaryNote });
  }
  return out;
}

function parseOptionsInput(body: Record<string, unknown>) {
  if (!isRecord(body.dish)) return null;
  const title = str(body.dish.title, LIMITS.title, { required: true });
  const type = str(body.dish.type, LIMITS.type);
  const servings = servingsOf(body.dish.servings);
  const attributes = tags(body.dish.attributes);
  const users = usersOf(body.users);
  if (!title || type === null || !servings || attributes === null || users === null) return null;
  return { dish: { title, type, servings, attributes }, users: users ?? [] };
}

function parseRecipeInput(body: Record<string, unknown>) {
  const dishTitle = str(body.dishTitle, LIMITS.title, { required: true });
  const recipeName = str(body.recipeName, LIMITS.title, { required: true });
  const servings = servingsOf(body.servings);
  const dietaryAttributes = tags(body.dietaryAttributes);
  const users = usersOf(body.users);
  if (!dishTitle || !recipeName || !servings || dietaryAttributes === null || users === null) {
    return null;
  }
  return { dishTitle, recipeName, servings, dietaryAttributes, users };
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
