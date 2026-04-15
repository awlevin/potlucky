"use client";

import { motion } from "framer-motion";
import { RecipeOption } from "@/types";

interface RecipeOptionPickerProps {
  dishTitle: string;
  dishIndex: number;
  options: RecipeOption[];
  selectedIdx: number | null;
  servings: number;
  onSelect: (idx: number) => void;
  onServingsChange: (servings: number) => void;
}

const tierLabels = ["Quick & Easy", "Balanced", "Impressive"];
const tierEmojis = ["⚡", "⚖️", "✨"];

export function RecipeOptionPicker({
  dishTitle,
  dishIndex,
  options,
  selectedIdx,
  servings,
  onSelect,
  onServingsChange,
}: RecipeOptionPickerProps) {
  return (
    <motion.div
      className="recipe-dish-group"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: dishIndex * 0.12, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="recipe-dish-header">
        <h4 className="recipe-dish-title">{dishTitle}</h4>
        <div className="recipe-servings-stepper">
          <span className="recipe-servings-label">Serves</span>
          <button
            className="recipe-stepper-btn"
            onClick={() => onServingsChange(Math.max(1, servings - 1))}
            aria-label="Decrease servings"
          >
            −
          </button>
          <span className="recipe-servings-value">{servings}</span>
          <button
            className="recipe-stepper-btn"
            onClick={() => onServingsChange(servings + 1)}
            aria-label="Increase servings"
          >
            +
          </button>
        </div>
      </div>

      <div className="recipe-options-row">
        {options.map((option, i) => (
          <motion.button
            key={i}
            className={`recipe-option-card${selectedIdx === i ? " recipe-option-card-selected" : ""}`}
            onClick={() => onSelect(i)}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: dishIndex * 0.12 + i * 0.06,
              duration: 0.35,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <div className="recipe-option-tier">
              <span>{tierEmojis[i]}</span>
              <span className="recipe-option-tier-label">{tierLabels[i]}</span>
            </div>
            <div className="recipe-option-name">{option.name}</div>
            <div className="recipe-option-desc">{option.description}</div>
            <div className="recipe-option-meta">
              <span className="recipe-option-time">{option.prepTime}</span>
              <span className="recipe-option-cost">
                ~${typeof option.cost === "number" ? option.cost.toFixed(0) : option.cost}
              </span>
            </div>
            {selectedIdx === i && (
              <motion.div
                className="recipe-option-check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25 }}
              >
                ✓
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
