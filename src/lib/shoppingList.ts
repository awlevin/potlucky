import { ShoppingItem } from "@/types";

const AISLE_ORDER = [
  "Produce",
  "Meat & Seafood",
  "Dairy & Eggs",
  "Bakery",
  "Pantry",
  "Spices & Seasonings",
  "Frozen",
  "Other",
];

function aisleRank(aisle: string): number {
  const idx = AISLE_ORDER.indexOf(aisle);
  return idx === -1 ? AISLE_ORDER.length : idx;
}

/**
 * Aggregate per-dish shopping items into a single list:
 * - Group by aisle (using canonical aisle order, unknown aisles pushed to end)
 * - Within an aisle, de-dup by lowercased item name; duplicate quantities join with " + "
 */
export function aggregateShoppingItems(
  itemsByDish: Record<string, ShoppingItem[]>,
  dishOrder: string[]
): ShoppingItem[] {
  const byAisle = new Map<string, Map<string, ShoppingItem>>();

  for (const dishId of dishOrder) {
    const items = itemsByDish[dishId] ?? [];
    for (const raw of items) {
      const aisle = raw.aisle?.trim() || "Other";
      const key = raw.item.trim().toLowerCase();
      if (!byAisle.has(aisle)) byAisle.set(aisle, new Map());
      const aisleMap = byAisle.get(aisle)!;
      const existing = aisleMap.get(key);
      if (existing) {
        existing.quantity = `${existing.quantity} + ${raw.quantity}`;
      } else {
        aisleMap.set(key, { ...raw, aisle });
      }
    }
  }

  const aisles = Array.from(byAisle.keys()).sort(
    (a, b) => aisleRank(a) - aisleRank(b)
  );
  const out: ShoppingItem[] = [];
  for (const aisle of aisles) {
    const aisleItems = Array.from(byAisle.get(aisle)!.values());
    for (const item of aisleItems) out.push(item);
  }
  return out;
}
