"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Food,
  User,
  RecipeOption,
  RecipeResult,
  ShoppingItem,
  RecipeCache,
} from "@/types";
import { RecipeOptionPicker } from "./RecipeOptionPicker";
import { RecipeDetail } from "./RecipeDetail";
import { ShoppingList } from "./ShoppingList";

type WizardStep =
  | "idle"
  | "loading-options"
  | "picking"
  | "loading-recipes"
  | "done";

interface RecipeWizardProps {
  myDishes: Food[];
  users: User[];
  currUser: User | undefined;
  roomId: string;
}

const loadingPhrases = [
  "Flipping through our cookbook...",
  "Prepping ingredients...",
  "Simmering ideas...",
  "Taste-testing options...",
  "Plating suggestions...",
];

function getCacheKey(roomId: string) {
  return `potlucky-recipes-${roomId}`;
}

function loadCache(roomId: string, currentDishIds: string[]): RecipeCache | null {
  try {
    const raw = localStorage.getItem(getCacheKey(roomId));
    if (!raw) return null;
    const cache: RecipeCache = JSON.parse(raw);

    // Invalidate if dishes changed
    const sorted = [...currentDishIds].sort().join(",");
    const cachedSorted = [...cache.dishIds].sort().join(",");
    if (sorted !== cachedSorted) return null;

    // Invalidate after 24 hours
    const age = Date.now() - new Date(cache.generatedAt).getTime();
    if (age > 24 * 60 * 60 * 1000) return null;

    return cache;
  } catch {
    return null;
  }
}

function saveCache(roomId: string, cache: RecipeCache) {
  try {
    localStorage.setItem(getCacheKey(roomId), JSON.stringify(cache));
  } catch {
    // localStorage full or unavailable — ignore
  }
}

function computeEligibility(dish: Food, users: User[]): { eligible: User[]; ineligible: User[] } {
  const eligible: User[] = [];
  const ineligible: User[] = [];
  for (const u of users) {
    if (!u.dietaryRestrictions?.length) {
      eligible.push(u);
    } else if (u.dietaryRestrictions.every((r) => dish.attributes?.includes(r))) {
      eligible.push(u);
    } else {
      ineligible.push(u);
    }
  }
  return { eligible, ineligible };
}

export function RecipeWizard({
  myDishes,
  users,
  currUser,
  roomId,
}: RecipeWizardProps) {
  const dishIds = useMemo(
    () => myDishes.map((d) => d.id),
    [myDishes]
  );

  // Try to restore from cache
  const cached = useMemo(() => loadCache(roomId, dishIds), [roomId, dishIds]);

  const [step, setStep] = useState<WizardStep>(() => {
    if (cached?.recipes?.length) return "done";
    if (cached?.options && Object.keys(cached.options).length) return "picking";
    return "idle";
  });

  const [dishOptions, setDishOptions] = useState<Record<string, RecipeOption[]>>(
    () => cached?.options ?? {}
  );
  const [selections, setSelections] = useState<Record<string, number>>(
    () => cached?.selections ?? {}
  );
  const [recipes, setRecipes] = useState<RecipeResult[]>(
    () => cached?.recipes ?? []
  );
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>(
    () => cached?.shoppingList ?? []
  );
  const [error, setError] = useState<string | null>(null);
  const [loadingPhrase, setLoadingPhrase] = useState(loadingPhrases[0]);

  // Derive servings from eligible users — no manual override needed
  const eligibilityMap = useMemo(() => {
    const map: Record<string, { eligible: User[]; ineligible: User[] }> = {};
    for (const dish of myDishes) {
      map[dish.id] = computeEligibility(dish, users);
    }
    return map;
  }, [myDishes, users]);

  const servings = useMemo(() => {
    const map: Record<string, number> = {};
    for (const dish of myDishes) {
      map[dish.id] = Math.max(eligibilityMap[dish.id]?.eligible.length ?? 0, 2);
    }
    return map;
  }, [myDishes, eligibilityMap]);

  // Rotate loading phrases
  useEffect(() => {
    if (step !== "loading-options" && step !== "loading-recipes") return;
    const interval = setInterval(() => {
      setLoadingPhrase((prev) => {
        const idx = loadingPhrases.indexOf(prev);
        return loadingPhrases[(idx + 1) % loadingPhrases.length];
      });
    }, 2200);
    return () => clearInterval(interval);
  }, [step]);

  const allSelected = myDishes.every((d) => d.id in selections);

  const handleGenerateOptions = useCallback(async () => {
    setStep("loading-options");
    setError(null);
    setLoadingPhrase(loadingPhrases[0]);

    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-options",
          dishes: myDishes.map((d) => ({
            title: d.title,
            type: d.type,
            servings: servings[d.id],
            attributes: d.attributes,
          })),
          users: users.map((u) => ({
            name: u.name,
            dietaryRestrictions: u.dietaryRestrictions,
            dietaryNote: u.dietaryNote,
          })),
        }),
      });

      if (!res.ok) throw new Error("API request failed");

      const data = await res.json();
      const optionsMap: Record<string, RecipeOption[]> = {};

      // Match returned dishes to our dish IDs by title
      for (const dish of myDishes) {
        const match = data.dishes?.find(
          (d: { originalTitle: string }) =>
            d.originalTitle.toLowerCase() === dish.title.toLowerCase()
        );
        if (match) {
          optionsMap[dish.id] = match.options;
        }
      }

      setDishOptions(optionsMap);
      setSelections({});
      setStep("picking");

      // Cache the options
      saveCache(roomId, {
        options: optionsMap,
        selections: {},
        servings,
        recipes: [],
        shoppingList: [],
        dishIds,
        generatedAt: new Date().toISOString(),
      });
    } catch {
      setError("Something went wrong generating recipe options. Please try again.");
      setStep("idle");
    }
  }, [myDishes, users, servings, roomId, dishIds]);

  const handleGenerateRecipes = useCallback(async () => {
    setStep("loading-recipes");
    setError(null);
    setLoadingPhrase(loadingPhrases[2]);

    try {
      const selectionsList = myDishes.map((dish) => {
        const option = dishOptions[dish.id]?.[selections[dish.id]];
        return {
          dishTitle: dish.title,
          recipeName: option?.name ?? dish.title,
          servings: servings[dish.id],
        };
      });

      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-recipes",
          selections: selectionsList,
        }),
      });

      if (!res.ok) throw new Error("API request failed");

      const data = await res.json();
      setRecipes(data.recipes ?? []);
      setShoppingList(data.shoppingList ?? []);
      setStep("done");

      // Cache everything
      saveCache(roomId, {
        options: dishOptions,
        selections,
        servings,
        recipes: data.recipes ?? [],
        shoppingList: data.shoppingList ?? [],
        dishIds,
        generatedAt: new Date().toISOString(),
      });
    } catch {
      setError("Something went wrong generating recipes. Please try again.");
      setStep("picking");
    }
  }, [myDishes, dishOptions, selections, servings, roomId, dishIds]);

  const handleReset = useCallback(() => {
    setStep("idle");
    setDishOptions({});
    setSelections({});
    setRecipes([]);
    setShoppingList([]);
    setError(null);
    localStorage.removeItem(getCacheKey(roomId));
  }, [roomId]);

  if (!currUser || myDishes.length === 0) return null;

  return (
    <div className="recipe-wizard">
      <AnimatePresence mode="wait">
        {/* ── Idle: Entry Banner ── */}
        {step === "idle" && (
          <motion.div
            key="banner"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
          >
            <button
              className="recipe-banner"
              onClick={handleGenerateOptions}
            >
              <div className="recipe-banner-visual">
                <span className="recipe-banner-emoji">👩‍🍳</span>
              </div>
              <div className="recipe-banner-content">
                <span className="recipe-banner-title">Ready to cook?</span>
                <span className="recipe-banner-subtitle">
                  Get recipes & a shopping list for your{" "}
                  {myDishes.length === 1
                    ? "dish"
                    : `${myDishes.length} dishes`}
                </span>
              </div>
              <span className="recipe-banner-arrow">→</span>
            </button>
            {error && (
              <p className="recipe-error">{error}</p>
            )}
          </motion.div>
        )}

        {/* ── Loading Options ── */}
        {step === "loading-options" && (
          <motion.div
            key="loading-options"
            className="recipe-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="recipe-loading-icon">
              <span className="recipe-loading-spoon">🥄</span>
            </div>
            <motion.p
              key={loadingPhrase}
              className="recipe-loading-text"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              {loadingPhrase}
            </motion.p>
          </motion.div>
        )}

        {/* ── Picking: Recipe Options ── */}
        {step === "picking" && (
          <motion.div
            key="picking"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="recipe-picker-header">
              <h3 className="section-label">
                <span style={{ fontSize: "1.125rem" }}>📖</span>
                Pick a recipe for each dish
              </h3>
              <button
                className="btn-ghost recipe-reset-link"
                onClick={handleReset}
              >
                Start over
              </button>
            </div>

            {myDishes.map((dish, i) => (
              <RecipeOptionPicker
                key={dish.id}
                dishTitle={dish.title}
                dishIndex={i}
                options={dishOptions[dish.id] ?? []}
                selectedIdx={selections[dish.id] ?? null}
                eligibleUsers={eligibilityMap[dish.id]?.eligible ?? []}
                ineligibleUsers={eligibilityMap[dish.id]?.ineligible ?? []}
                onSelect={(idx) => {
                  const next = { ...selections, [dish.id]: idx };
                  setSelections(next);
                  // Update cache with selection
                  saveCache(roomId, {
                    options: dishOptions,
                    selections: next,
                    servings,
                    recipes: [],
                    shoppingList: [],
                    dishIds,
                    generatedAt: new Date().toISOString(),
                  });
                }}
              />
            ))}

            <AnimatePresence>
              {allSelected && (
                <motion.div
                  className="recipe-generate-cta"
                  initial={{ opacity: 0, y: 16, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: 16, height: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <button
                    className="btn btn-lg recipe-generate-btn"
                    onClick={handleGenerateRecipes}
                  >
                    Get my recipes & shopping list
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {error && <p className="recipe-error">{error}</p>}
          </motion.div>
        )}

        {/* ── Loading Recipes ── */}
        {step === "loading-recipes" && (
          <motion.div
            key="loading-recipes"
            className="recipe-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="recipe-loading-icon">
              <span className="recipe-loading-spoon">📝</span>
            </div>
            <motion.p
              key={loadingPhrase}
              className="recipe-loading-text"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
            >
              {loadingPhrase}
            </motion.p>
          </motion.div>
        )}

        {/* ── Done: Recipes + Shopping List ── */}
        {step === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="recipe-picker-header">
              <h3 className="section-label">
                <span style={{ fontSize: "1.125rem" }}>📖</span>
                Your recipes
              </h3>
              <button
                className="btn-ghost recipe-reset-link"
                onClick={handleReset}
              >
                Start over
              </button>
            </div>

            {recipes.map((recipe, i) => (
              <RecipeDetail key={i} recipe={recipe} index={i} />
            ))}

            {shoppingList.length > 0 && (
              <ShoppingList items={shoppingList} roomId={roomId} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
