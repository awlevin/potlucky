"use client"

import { useEffect, useState } from "react";
import { LuDelete, LuCheck } from "react-icons/lu";
import { Food, User } from "@/types";
import { AnimatePresence, motion } from "framer-motion";

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
  currUser
}: FoodListProps) => {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
      <AnimatePresence>
        {foods.map((food) => {
          const userClaimedBy = users?.find((u) => u.id === food.claimedBy);
          const isForSelectedUser =
            Boolean(food.claimedBy && food.claimedBy === currUser?.id);

          return (
            <motion.div
              key={food.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <FoodItemRow
                food={food}
                claimFood={claimFood}
                removeFood={removeFood}
                userClaimedBy={userClaimedBy}
                isForSelectedUser={isForSelectedUser}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

interface FoodItemRowProps {
  food: Food;
  claimFood: (id: string) => void;
  removeFood: (id: string) => void;
  userClaimedBy: User | undefined;
  isForSelectedUser: boolean;
}

const FoodItemRow = ({
  food,
  claimFood,
  removeFood,
  userClaimedBy,
  isForSelectedUser,
}: FoodItemRowProps) => {
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
  const isClaimedByOther = !!userClaimedBy && !isForSelectedUser;

  const stateClass = isForSelectedUser
    ? "food-item-mine"
    : isUnclaimed
      ? "food-item-unclaimed"
      : "food-item-claimed";

  return (
    <motion.div whileTap={{ scale: 0.97 }}>
      <div
        className={`food-item ${stateClass}`}
        onClick={() => claimFood(food.id)}
        role="button"
        tabIndex={0}
      >
        <span
          style={{
            fontSize: "0.875rem",
            fontWeight: isForSelectedUser ? 600 : 400,
          }}
        >
          {food.title}
        </span>
        {isClaimedByOther && userClaimedBy && (
          <span className="badge badge-brand">
            {userClaimedBy.name}
          </span>
        )}
        {isForSelectedUser && userClaimedBy && (
          <span className="badge badge-accent">
            {userClaimedBy.name}
          </span>
        )}
        <button
          aria-label={`Remove ${food.title}`}
          className={`item-delete-btn ${isClicked ? "confirm" : ""}`}
          onClick={handleDelete}
          type="button"
          title={isClicked ? "Click again to confirm" : `Remove ${food.title}`}
        >
          {isClicked ? <LuCheck /> : <LuDelete />}
        </button>
      </div>
    </motion.div>
  );
};
