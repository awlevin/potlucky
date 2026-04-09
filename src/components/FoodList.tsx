"use client"

import { useEffect, useState } from "react";
import { Food, User } from "@/types";
import { AnimatePresence, motion } from "framer-motion";

const ATTRIBUTE_BADGES: Record<NonNullable<Food["attributes"]>[number], string> = {
  vegetarian: "\u{1F331}",
  vegan: "\u{1F33F}",
  "gluten-free": "GF",
  "nut-free": "\u{1F95C}\u2715",
  "dairy-free": "\u{1F95B}\u2715",
};

const CATEGORY_ORDER: Food["type"][] = [
  "appetizer",
  "main",
  "side",
  "dessert",
  "drink",
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
  // Sort foods: by category order, then alphabetically within each category
  const sorted = [...foods].sort((a, b) => {
    const catA = CATEGORY_ORDER.indexOf(a.type ?? ("other" as any));
    const catB = CATEGORY_ORDER.indexOf(b.type ?? ("other" as any));
    const orderA = catA === -1 ? CATEGORY_ORDER.length : catA;
    const orderB = catB === -1 ? CATEGORY_ORDER.length : catB;
    if (orderA !== orderB) return orderA - orderB;
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="menu-list">
      <AnimatePresence initial={false}>
        {sorted.map((food, i) => {
          const prevFood = i > 0 ? sorted[i - 1] : null;
          const showCategory = !prevFood || prevFood.type !== food.type;
          const userClaimedBy = users?.find((u) => u.id === food.claimedBy);
          const isMine = Boolean(food.claimedBy && food.claimedBy === currUser?.id);

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
                userClaimedBy={userClaimedBy}
                isMine={isMine}
                showCategory={showCategory}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

interface MenuRowProps {
  food: Food;
  claimFood: (id: string) => void;
  removeFood: (id: string) => void;
  userClaimedBy: User | undefined;
  isMine: boolean;
  showCategory: boolean;
}

const MenuRow = ({
  food,
  claimFood,
  removeFood,
  userClaimedBy,
  isMine,
  showCategory,
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

  const isUnclaimed = !userClaimedBy;
  const isClaimedByOther = !!userClaimedBy && !isMine;

  const rowClasses = [
    "menu-row",
    isMine ? "menu-row-mine" : "",
    isUnclaimed ? "menu-row-unclaimed" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={rowClasses}
      onClick={() => claimFood(food.id)}
      role="button"
      tabIndex={0}
    >
      {/* Dish info */}
      <div className="menu-dish-info">
        <div className="menu-dish-name">
          {food.title}
          {food.attributes?.map((attr) => (
            <span key={attr} className="food-badge" title={attr}>
              {ATTRIBUTE_BADGES[attr]}
            </span>
          ))}
        </div>
        {food.notes && (
          <div className="menu-dish-note">{food.notes}</div>
        )}
      </div>

      {/* Category tag — only on first item of each group */}
      <span className="menu-category-tag">
        {showCategory ? (food.type ?? "other") : ""}
      </span>

      {/* Claimer */}
      {isMine && userClaimedBy ? (
        <span className="menu-claimer menu-claimer-you">you</span>
      ) : isClaimedByOther && userClaimedBy ? (
        <span className="menu-claimer menu-claimer-other">
          {userClaimedBy.name}
        </span>
      ) : (
        <span className="menu-claimer menu-claimer-none">&mdash;</span>
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
