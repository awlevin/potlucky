"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RecipeOption, RecipeResult, User } from "@/types";
import { pickRandomLoadingMessage } from "@/lib/loadingMessages";
import { RecipeDetail } from "./RecipeDetail";

const tierLabels = ["Quick & Easy", "Balanced", "Impressive"];
const tierEmojis = ["\u26A1", "\u2696\uFE0F", "\u2728"];

const DOT_COLORS = [
  "#E07C5A", "#6BA37E", "#5B8DB8", "#C5A55A", "#9B72B0",
  "#D4726A", "#5AAE9E", "#7B8FC4", "#BC8F5E", "#8EB86A",
];

function getUserColor(index: number): string {
  return DOT_COLORS[index % DOT_COLORS.length];
}

interface DishRowProps {
  dishTitle: string;
  dishIndex: number;
  eligibleUsers: User[];
  ineligibleUsers: User[];
  phase: "picking" | "cooking";
  // picking
  options: RecipeOption[] | undefined;
  optionsError?: string;
  onRetryOptions: () => void;
  selectedIdx: number | null;
  onSelect: (idx: number) => void;
  // cooking
  recipe: RecipeResult | undefined;
  recipeError?: string;
  onRetryRecipe: () => void;
}

function EligibilityIndicator({
  eligibleUsers,
  ineligibleUsers,
}: {
  eligibleUsers: User[];
  ineligibleUsers: User[];
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const totalUsers = eligibleUsers.length + ineligibleUsers.length;
  const allEligible = ineligibleUsers.length === 0;

  return (
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
        {allEligible ? `Feeds everyone` : `${eligibleUsers.length} of ${totalUsers}`}
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
              <div className="recipe-tooltip-heading recipe-tooltip-heading-ok">Can eat this</div>
              {eligibleUsers.map((u, i) => (
                <div key={u.id} className="recipe-tooltip-user">
                  <span className="recipe-tooltip-dot" style={{ backgroundColor: getUserColor(i) }} />
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
  );
}

function OptionsSkeleton() {
  return (
    <div className="recipe-options-row">
      {[0, 1, 2].map((i) => (
        <div key={i} className="recipe-option-card recipe-option-card-skeleton" aria-hidden>
          <div className="recipe-option-tier">
            <span className="recipe-skeleton-chip" style={{ width: 64 }} />
          </div>
          <div className="recipe-skeleton-line" style={{ width: "85%", height: 14 }} />
          <div className="recipe-skeleton-line" style={{ width: "95%", height: 10 }} />
          <div className="recipe-skeleton-line" style={{ width: "60%", height: 10 }} />
          <div className="recipe-option-meta">
            <span className="recipe-skeleton-chip" style={{ width: 44 }} />
            <span className="recipe-skeleton-chip" style={{ width: 36 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function OptionCards({
  options,
  selectedIdx,
  onSelect,
  dishIndex,
}: {
  options: RecipeOption[];
  selectedIdx: number | null;
  onSelect: (idx: number) => void;
  dishIndex: number;
}) {
  return (
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
            delay: dishIndex * 0.06 + i * 0.04,
            duration: 0.3,
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
  );
}

function CookingPlaceholder({
  option,
  selectedIdx,
}: {
  option: RecipeOption | undefined;
  selectedIdx: number | null;
}) {
  const [loadingMessage] = useState(pickRandomLoadingMessage);
  if (!option) {
    return (
      <div className="recipe-cooking-placeholder">
        <div className="recipe-skeleton-line" style={{ width: "50%", height: 14 }} />
        <div className="recipe-skeleton-line" style={{ width: "90%", height: 10, marginTop: 10 }} />
        <div className="recipe-skeleton-line" style={{ width: "80%", height: 10 }} />
      </div>
    );
  }
  const tierIdx = selectedIdx ?? 0;
  return (
    <motion.div
      className="recipe-cooking-placeholder"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="recipe-cooking-head">
        <div className="recipe-cooking-tier">
          <span>{tierEmojis[tierIdx]}</span>
          <span className="recipe-option-tier-label">{tierLabels[tierIdx]}</span>
        </div>
        <div className="recipe-cooking-meta">
          <span className="recipe-option-time">{option.prepTime}</span>
          <span className="recipe-option-cost">
            ~${typeof option.cost === "number" ? option.cost.toFixed(0) : option.cost}
          </span>
        </div>
      </div>
      <div className="recipe-cooking-name">{option.name}</div>
      <div className="recipe-cooking-status">
        <span className="recipe-cooking-spoon">🥄</span>
        <span>{loadingMessage}</span>
      </div>
      <div className="recipe-skeleton-block" />
    </motion.div>
  );
}

export function DishRow({
  dishTitle,
  dishIndex,
  eligibleUsers,
  ineligibleUsers,
  phase,
  options,
  optionsError,
  onRetryOptions,
  selectedIdx,
  onSelect,
  recipe,
  recipeError,
  onRetryRecipe,
}: DishRowProps) {
  const selectedOption =
    selectedIdx !== null && options ? options[selectedIdx] : undefined;

  const eligibilityNode = (
    <EligibilityIndicator
      eligibleUsers={eligibleUsers}
      ineligibleUsers={ineligibleUsers}
    />
  );

  // When a recipe is loaded, the recipe card carries the dish title in its eyebrow,
  // so the outer dish-header would just duplicate it. Skip it then.
  const recipeLoaded = phase === "cooking" && !!recipe;

  return (
    <motion.div
      layout
      className="recipe-dish-group"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: dishIndex * 0.08, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {!recipeLoaded && (
        <div className="recipe-dish-header">
          <h4 className="recipe-dish-title">{dishTitle}</h4>
          {eligibilityNode}
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        {phase === "picking" ? (
          <motion.div
            key="picking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {optionsError ? (
              <div className="recipe-dish-error">
                <span>Couldn&apos;t load recipe options for this dish.</span>
                <button className="btn-ghost recipe-retry-link" onClick={onRetryOptions}>
                  Try again
                </button>
              </div>
            ) : options ? (
              <OptionCards
                options={options}
                selectedIdx={selectedIdx}
                onSelect={onSelect}
                dishIndex={dishIndex}
              />
            ) : (
              <OptionsSkeleton />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="cooking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {recipeError ? (
              <div className="recipe-dish-error">
                <span>Couldn&apos;t generate this recipe.</span>
                <button className="btn-ghost recipe-retry-link" onClick={onRetryRecipe}>
                  Try again
                </button>
              </div>
            ) : recipe ? (
              <RecipeDetail recipe={recipe} index={0} eligibility={eligibilityNode} />
            ) : (
              <CookingPlaceholder option={selectedOption} selectedIdx={selectedIdx} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
