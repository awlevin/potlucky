"use client"

import { useEffect, useState } from "react";
import { Food, User } from "@/types";
import { AnimatePresence, motion } from "framer-motion";

const ATTRIBUTE_BADGES: Record<NonNullable<Food["attributes"]>[number], { emoji: string; label: string }> = {
  vegetarian: { emoji: "\u{1F331}", label: "Vegetarian" },
  vegan: { emoji: "\u{1F33F}", label: "Vegan" },
  "gluten-free": { emoji: "GF", label: "Gluten-free" },
  "nut-free": { emoji: "\u{1F95C}\u2715", label: "Nut-free" },
  "dairy-free": { emoji: "\u{1F95B}\u2715", label: "Dairy-free" },
};

const CATEGORY_ORDER: { key: NonNullable<Food["type"]>; label: string; emoji: string }[] = [
  { key: "appetizer", label: "Appetizers", emoji: "🥗" },
  { key: "main", label: "Mains", emoji: "🍖" },
  { key: "side", label: "Sides", emoji: "🥘" },
  { key: "dessert", label: "Desserts", emoji: "🍰" },
  { key: "drink", label: "Drinks", emoji: "🥤" },
];

interface FoodListProps {
  foods: Food[];
  claimFood: (id: string) => void;
  removeFood: (id: string) => void;
  users: User[] | undefined;
  currUser: User | undefined;
}

export const FoodList = ({
  foods,
  claimFood,
  removeFood,
  users,
  currUser,
}: FoodListProps) => {
  // Group foods by category
  const grouped = CATEGORY_ORDER.map(({ key, label, emoji }) => ({
    key,
    label,
    emoji,
    items: foods
      .filter((f) => f.type === key)
      .sort((a, b) => a.title.localeCompare(b.title)),
  })).filter((g) => g.items.length > 0);

  // Collect any foods without a recognized category
  const uncategorized = foods.filter(
    (f) => !f.type || !CATEGORY_ORDER.some((c) => c.key === f.type)
  );
  if (uncategorized.length > 0) {
    grouped.push({
      key: "other" as NonNullable<Food["type"]>,
      label: "Other",
      emoji: "📋",
      items: uncategorized.sort((a, b) => a.title.localeCompare(b.title)),
    });
  }

  // Check if any food has dietary attributes (to show the legend)
  const hasAnyAttributes = foods.some((f) => f.attributes && f.attributes.length > 0);
  // Collect only the attributes that are actually used
  const usedAttributes = new Set<string>();
  foods.forEach((f) => f.attributes?.forEach((a) => usedAttributes.add(a)));

  return (
    <div>
      <div className="menu-list">
        {grouped.map((group) => (
          <div key={group.key} className="menu-group">
            <div className="menu-group-header">
              <span className="menu-group-emoji">{group.emoji}</span>
              <span className="menu-group-label">{group.label}</span>
              <span className="menu-group-count">{group.items.length}</span>
            </div>
            <AnimatePresence initial={false}>
              {group.items.map((food) => {
                // Normalize claimedBy to array for multi-claimer support
                const claimerIds = Array.isArray(food.claimedBy)
                  ? food.claimedBy
                  : food.claimedBy
                  ? [food.claimedBy]
                  : [];
                const claimers = claimerIds
                  .map((uid) => users?.find((u) => u.id === uid))
                  .filter(Boolean) as User[];
                const isMine = Boolean(currUser && claimerIds.includes(currUser.id));
                return (
                  <motion.div
                    key={food.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MenuRow
                      food={food}
                      claimFood={claimFood}
                      removeFood={removeFood}
                      claimers={claimers}
                      isMine={isMine}
                      currUser={currUser}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Dietary legend — only show if at least one food has attributes */}
      {hasAnyAttributes && (
        <div className="dietary-legend">
          {Object.entries(ATTRIBUTE_BADGES)
            .filter(([key]) => usedAttributes.has(key))
            .map(([key, { emoji, label }]) => (
              <span key={key} className="dietary-legend-item">
                <span className="food-badge">{emoji}</span> {label}
              </span>
            ))}
        </div>
      )}
    </div>
  );
};

interface MenuRowProps {
  food: Food;
  claimFood: (id: string) => void;
  removeFood: (id: string) => void;
  claimers: User[];
  isMine: boolean;
  currUser: User | undefined;
}

const MenuRow = ({
  food,
  claimFood,
  removeFood,
  claimers,
  isMine,
  currUser,
}: MenuRowProps) => {
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    if (isClicked) {
      const timer = setTimeout(() => {
        setIsClicked(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isClicked]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isClicked) {
      setIsClicked(true);
    } else {
      removeFood(food.id);
    }
  };

  const isUnclaimed = claimers.length === 0;

  const rowClasses = [
    "menu-row",
    isMine ? "menu-row-mine" : "",
    isUnclaimed ? "menu-row-unclaimed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Build claimer display
  const claimerParts: { name: string; isYou: boolean }[] = claimers.map((u) => ({
    name: u.name,
    isYou: Boolean(currUser && u.id === currUser.id),
  }));
  // Put "you" first if present
  claimerParts.sort((a, b) => (a.isYou ? -1 : b.isYou ? 1 : 0));

  return (
    <div
      className={rowClasses}
      onClick={() => claimFood(food.id)}
      role="button"
      tabIndex={0}
    >
      <div className="menu-dish-info">
        <div className="menu-dish-name">
          {food.title}
          {food.attributes?.map((attr) => (
            <span key={attr} className="food-badge" title={ATTRIBUTE_BADGES[attr]?.label || attr}>
              {ATTRIBUTE_BADGES[attr]?.emoji || attr}
            </span>
          ))}
        </div>
        {food.notes && (
          <div className="menu-dish-note">{food.notes}</div>
        )}
      </div>

      {/* Claimers */}
      {isUnclaimed ? (
        <span className="menu-claimer menu-claimer-none">&mdash;</span>
      ) : (
        <span className="menu-claimer">
          {claimerParts.map((c, i) => (
            <span key={c.name}>
              {i > 0 && <span className="menu-claimer-sep">, </span>}
              <span className={c.isYou ? "menu-claimer-you" : "menu-claimer-other"}>
                {c.isYou ? "you" : c.name}
              </span>
            </span>
          ))}
        </span>
      )}

      {/* Delete button */}
      <button
        aria-label={`Remove ${food.title}`}
        className={`menu-delete ${isClicked ? "menu-delete-confirm" : ""}`}
        onClick={handleDelete}
        type="button"
        title={isClicked ? "Click again to confirm" : `Remove ${food.title}`}
      >
        {isClicked ? "\u2713" : "\u00d7"}
      </button>
    </div>
  );
};
