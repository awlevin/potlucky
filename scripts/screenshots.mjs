// Seeds a demo potluck into the local Firestore emulator and captures the
// README screenshots with Playwright. All names and dishes are made up.
//
//   yarn emulators            # terminal 1
//   yarn dev                  # terminal 2 (with the emulator .env.local)
//   yarn screenshots          # terminal 3
//
// Output: docs/screenshots/*.png
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const APP = process.env.APP_URL || "http://localhost:3000";
const EMULATOR = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
const PROJECT = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-potlucky";
const OUT = new URL("../docs/screenshots/", import.meta.url).pathname;
const ROOM_ID = "pumpkin-pleasant-demo1";

const users = [
  { id: "u-maya", name: "Maya", color: "#E8A817", dietaryRestrictions: ["vegetarian"] },
  { id: "u-theo", name: "Theo", color: "#4EA24E" },
  { id: "u-priya", name: "Priya", color: "#D4502E", dietaryRestrictions: ["gluten-free"] },
  { id: "u-sam", name: "Sam", color: "#7C5BC4" },
  { id: "u-jordan", name: "Jordan", color: "#2C8AB8", dietaryRestrictions: ["vegan"] },
];

const foods = [
  { id: "f1", title: "Herb-roasted turkey", type: "main", claimedBy: "u-theo" },
  { id: "f2", title: "Mushroom wellington", type: "main", claimedBy: "u-maya", attributes: ["vegetarian"] },
  { id: "f3", title: "Mac & cheese", type: "side", claimedBy: "u-sam", attributes: ["vegetarian"] },
  { id: "f4", title: "Cornbread stuffing", type: "side", claimedBy: null },
  { id: "f5", title: "Cranberry sauce", type: "side", claimedBy: "u-jordan", attributes: ["vegan", "gluten-free"] },
  { id: "f6", title: "Maple-glazed carrots", type: "side", claimedBy: null, attributes: ["vegan", "gluten-free"] },
  { id: "f7", title: "Burrata & persimmon", type: "appetizer", claimedBy: "u-priya", attributes: ["vegetarian", "gluten-free"] },
  { id: "f8", title: "Spiced nuts", type: "appetizer", claimedBy: null },
  { id: "f9", title: "Pumpkin pie", type: "dessert", claimedBy: "u-maya", attributes: ["vegetarian"] },
  { id: "f10", title: "Apple crumble", type: "dessert", claimedBy: null },
  { id: "f11", title: "Mulled cider", type: "drink", claimedBy: "u-jordan", attributes: ["vegan"] },
];

const room = {
  id: ROOM_ID,
  name: "Friendsgiving 2026",
  date: "Saturday, November 21, 2026",
  location: "Maya's place",
  users,
  foods,
  hostIds: ["u-maya"],
};

// --- Firestore REST encoding -------------------------------------------------
function toValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
  if (typeof v === "object") return { mapValue: { fields: toFields(v) } };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  return { stringValue: String(v) };
}
function toFields(obj) {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, toValue(v)]));
}

async function seed() {
  const url = `http://${EMULATOR}/v1/projects/${PROJECT}/databases/(default)/documents/rooms/${ROOM_ID}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields: toFields(room) }),
  });
  if (!res.ok) throw new Error(`Seeding failed (${res.status}): ${await res.text()}`);
}

// --- Capture -------------------------------------------------------------------
async function settle(page) {
  // Firestore keeps a listen channel open, so "networkidle" never fires.
  await page.waitForLoadState("load");
  await page.waitForTimeout(2500);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  await seed();

  const browser = await chromium.launch();
  const desktop = { viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 };
  const desktopTall = { ...desktop, viewport: { width: 1280, height: 1000 } };
  const mobile = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
  const asMaya = (ctx) =>
    ctx.addInitScript(
      ([key, value]) => {
        localStorage.setItem(key, value);
        localStorage.setItem("hasCompletedOnboardingBefore", "true");
      },
      [`potlucky-identity-${ROOM_ID}`, JSON.stringify({ id: "u-maya", name: "Maya" })]
    );

  // Room, desktop, signed in as the host
  {
    const ctx = await browser.newContext(desktopTall);
    await asMaya(ctx);
    const page = await ctx.newPage();
    await page.goto(`${APP}/potlucks/${ROOM_ID}`);
    await settle(page);
    await page.screenshot({ path: `${OUT}room.png` });
    await ctx.close();
  }

  // Room, mobile
  {
    const ctx = await browser.newContext(mobile);
    await asMaya(ctx);
    const page = await ctx.newPage();
    await page.goto(`${APP}/potlucks/${ROOM_ID}`);
    await settle(page);
    await page.screenshot({ path: `${OUT}room-mobile.png` });
    await ctx.close();
  }

  // Identity gate, as a first-time guest opening the shared link
  {
    const ctx = await browser.newContext(mobile);
    const page = await ctx.newPage();
    await page.goto(`${APP}/potlucks/${ROOM_ID}`);
    await settle(page);
    await page.screenshot({ path: `${OUT}join-mobile.png` });
    await ctx.close();
  }

  // Per-room link preview (Open Graph image)
  {
    const res = await fetch(`${APP}/potlucks/${ROOM_ID}/opengraph-image`);
    if (!res.ok) throw new Error(`OG image failed: ${res.status}`);
    await writeFile(`${OUT}og-room.png`, Buffer.from(await res.arrayBuffer()));
  }

  await browser.close();
  console.log(`Screenshots written to ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
