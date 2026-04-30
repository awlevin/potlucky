"use client";
import { useState, useCallback } from "react";
import { Food } from "@/types";
import { suggestions } from "@/data/suggestions";

const categoryEmojis: Record<string, string> = {
  appetizer: "\uD83E\uDDC0",
  main: "\uD83C\uDF56",
  side: "\uD83E\uDD57",
  dessert: "\uD83C\uDF70",
  drink: "\uD83C\uDF79",
};

interface DishSuggestionProps {
  foods: Food[];
  onAdd: (title: string, category: Food["type"]) => void;
}

function pickUnderrepresentedCategory(foods: Food[]): string {
  const categories = Object.keys(suggestions);
  const counts: Record<string, number> = {};
  for (const cat of categories) {
    counts[cat] = 0;
  }
  for (const food of foods) {
    const t = food.type || "main";
    if (counts[t] !== undefined) {
      counts[t]++;
    }
  }
  // Find the minimum count
  let minCount = Infinity;
  for (const cat of categories) {
    if (counts[cat] < minCount) {
      minCount = counts[cat];
    }
  }
  // Collect all categories at the minimum
  const candidates = categories.filter((cat) => counts[cat] === minCount);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function pickRandomDish(category: string): string {
  const dishes = suggestions[category] || [];
  return dishes[Math.floor(Math.random() * dishes.length)];
}

export function DishSuggestion({ foods, onAdd }: DishSuggestionProps) {
  const [open, setOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string>("");
  const [currentDish, setCurrentDish] = useState<string>("");

  const generate = useCallback(() => {
    const cat = pickUnderrepresentedCategory(foods);
    const dish = pickRandomDish(cat);
    setCurrentCategory(cat);
    setCurrentDish(dish);
  }, [foods]);

  const handleOpen = () => {
    generate();
    setOpen(true);
  };

  const handleTryAnother = () => {
    generate();
  };

  const handleAdd = () => {
    onAdd(currentDish, currentCategory as Food["type"]);
    setOpen(false);
  };

  const handleDismiss = () => {
    setOpen(false);
  };

  if (!open) {
    return (
      <button className="suggestion-trigger" onClick={handleOpen} type="button">
        Need ideas? {"\uD83D\uDCA1"}
      </button>
    );
  }

  const emoji = categoryEmojis[currentCategory] || "\uD83C\uDF7D\uFE0F";

  return (
    <div className="suggestion-card">
      <button
        className="btn-ghost btn-xs"
        onClick={handleDismiss}
        type="button"
        style={{ float: "right", fontSize: "16px" }}
        aria-label="Dismiss suggestion"
      >
        {"\u2715"}
      </button>
      <div style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
        How about...
      </div>
      <div className="suggestion-dish">
        {currentDish} {emoji}
      </div>
      <div className="suggestion-actions">
        <button className="btn btn-sm" onClick={handleAdd} type="button">
          Add it {"\u2713"}
        </button>
        <button
          className="btn btn-sm btn-outline"
          onClick={handleTryAnother}
          type="button"
        >
          Try another {"\u2192"}
        </button>
      </div>
    </div>
  );
}
