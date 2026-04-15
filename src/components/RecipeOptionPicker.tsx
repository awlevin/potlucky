"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RecipeOption, User } from "@/types";

interface RecipeOptionPickerProps {
  dishTitle: string;
  dishIndex: number;
  options: RecipeOption[];
  selectedIdx: number | null;
  eligibleUsers: User[];
  ineligibleUsers: User[];
  onSelect: (idx: number) => void;
}

const tierLabels = ["Quick & Easy", "Balanced", "Impressive"];
const tierEmojis = ["\u26A1", "\u2696\uFE0F", "\u2728"];

const DOT_COLORS = [
  "#E07C5A", "#6BA37E", "#5B8DB8", "#C5A55A", "#9B72B0",
  "#D4726A", "#5AAE9E", "#7B8FC4", "#BC8F5E", "#8EB86A",
];

function getUserColor(index: number): string {
  return DOT_COLORS[index % DOT_COLORS.length];
}

export function RecipeOptionPicker({
  dishTitle,
  dishIndex,
  options,
  selectedIdx,
  eligibleUsers,
  ineligibleUsers,
  onSelect,
}: RecipeOptionPickerProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const totalUsers = eligibleUsers.length + ineligibleUsers.length;
  const allEligible = ineligibleUsers.length === 0;

  return (
    <motion.div
      className="recipe-dish-group"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: dishIndex * 0.12, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="recipe-dish-header">
        <h4 className="recipe-dish-title">{dishTitle}</h4>
        <div
          className="recipe-eligibility"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowTooltip((v) => !v)}
        >
          <div className="recipe-eligibility-dots">
            {eligibleUsers.map((u, i) => (
              <span
                key={u.id}
                className="recipe-eligibility-dot"
                style={{ backgroundColor: getUserColor(i) }}
                title={u.name}
              />
            ))}
          </div>
          <span className={`recipe-eligibility-label${allEligible ? " recipe-eligibility-all" : ""}`}>
            {allEligible
              ? `Feeds everyone`
              : `${eligibleUsers.length} of ${totalUsers}`}
          </span>

          <AnimatePresence>
            {showTooltip && (
              <motion.div
                className="recipe-eligibility-tooltip"
                initial={{ opacity: 0, y: 4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.96 }}
                transition={{ duration: 0.15 }}
              >
                <div className="recipe-tooltip-section">
                  <div className="recipe-tooltip-heading recipe-tooltip-heading-ok">
                    Can eat this
                  </div>
                  {eligibleUsers.map((u, i) => (
                    <div key={u.id} className="recipe-tooltip-user">
                      <span
                        className="recipe-tooltip-dot"
                        style={{ backgroundColor: getUserColor(i) }}
                      />
                      <span className="recipe-tooltip-name">{u.name}</span>
                    </div>
                  ))}
                </div>

                {ineligibleUsers.length > 0 && (
                  <div className="recipe-tooltip-section recipe-tooltip-section-blocked">
                    <div className="recipe-tooltip-heading recipe-tooltip-heading-blocked">
                      Can&apos;t eat this
                    </div>
                    {ineligibleUsers.map((u) => (
                      <div key={u.id} className="recipe-tooltip-user">
                        <span className="recipe-tooltip-dot recipe-tooltip-dot-blocked" />
                        <span className="recipe-tooltip-name">{u.name}</span>
                        {u.dietaryRestrictions && u.dietaryRestrictions.length > 0 && (
                          <span className="recipe-tooltip-reason">
                            {u.dietaryRestrictions.join(", ")}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
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
