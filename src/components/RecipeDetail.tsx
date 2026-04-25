"use client";

import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { RecipeResult } from "@/types";

interface RecipeDetailProps {
  recipe: RecipeResult;
  index: number;
  /** Optional eligibility indicator rendered in the card eyebrow. */
  eligibility?: ReactNode;
}

export function RecipeDetail({ recipe, index, eligibility }: RecipeDetailProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <motion.div
      className="recipe-detail-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.1,
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      {eligibility && (
        <div className="recipe-detail-eyebrow">
          <span className="recipe-detail-dish-label">{recipe.dishTitle}</span>
          {eligibility}
        </div>
      )}
      <button
        className="recipe-detail-header"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <div className="recipe-detail-header-left">
          {!eligibility && (
            <span className="recipe-detail-dish-label">{recipe.dishTitle}</span>
          )}
          <span className="recipe-detail-name">{recipe.recipeName}</span>
        </div>
        <div className="recipe-detail-header-right">
          <span className="recipe-detail-meta-pill">{recipe.prepTime}</span>
          <span className="recipe-detail-meta-pill">
            Serves {recipe.servings}
          </span>
          <span className="recipe-detail-chevron">
            {expanded ? "▲" : "▼"}
          </span>
        </div>
      </button>

      {expanded && (
        <motion.div
          className="recipe-detail-body"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          {/* Ingredients */}
          <div className="recipe-detail-section">
            <h5 className="recipe-detail-section-title">Ingredients</h5>
            <ul className="recipe-detail-ingredients">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="recipe-detail-ingredient">
                  <span className="recipe-ingredient-qty">{ing.quantity}</span>
                  <span className="recipe-ingredient-item">{ing.item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div className="recipe-detail-section">
            <h5 className="recipe-detail-section-title">Instructions</h5>
            <ol className="recipe-detail-steps">
              {recipe.steps.map((step, i) => (
                <li key={i} className="recipe-detail-step">
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Tip */}
          {recipe.tips && (
            <div className="recipe-detail-tip">
              <span className="recipe-detail-tip-icon">💡</span>
              <span>{recipe.tips}</span>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
