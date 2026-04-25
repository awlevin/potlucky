"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Food,
  User,
  RecipeOption,
  RecipeResult,
  ShoppingItem,
  RecipeCache,
} from "@/types";
import { DishRow } from "./DishRow";
import { ShoppingList } from "./ShoppingList";
import { aggregateShoppingItems } from "@/lib/shoppingList";
import { readStreamToString, parseJsonLoose } from "@/lib/streamJson";

type Phase = "idle" | "picking" | "cooking";

interface RecipeWizardProps {
  myDishes: Food[];
  users: User[];
  currUser: User | undefined;
  roomId: string;
}

function getCacheKey(roomId: string) {
  return `potlucky-recipes-${roomId}`;
}

function loadCache(
  roomId: string,
  currentDishIds: string[]
): RecipeCache | null {
  try {
    const raw = localStorage.getItem(getCacheKey(roomId));
    if (!raw) return null;
    const cache = JSON.parse(raw) as Partial<RecipeCache>;

    // Invalidate if dishes changed
    const sorted = [...currentDishIds].sort().join(",");
    const cachedSorted = [...(cache.dishIds ?? [])].sort().join(",");
    if (sorted !== cachedSorted) return null;

    // Invalidate after 24 hours
    if (!cache.generatedAt) return null;
    const age = Date.now() - new Date(cache.generatedAt).getTime();
    if (age > 24 * 60 * 60 * 1000) return null;

    // Migrate older caches that don't have recipesByDish — drop recipes, keep options
    return {
      options: cache.options ?? {},
      selections: cache.selections ?? {},
      servings: cache.servings ?? {},
      recipesByDish: cache.recipesByDish ?? {},
      shoppingItemsByDish: cache.shoppingItemsByDish ?? {},
      dishIds: cache.dishIds ?? [],
      generatedAt: cache.generatedAt,
    };
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

function computeEligibility(
  dish: Food,
  users: User[]
): { eligible: User[]; ineligible: User[] } {
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
  const dishIds = useMemo(() => myDishes.map((d) => d.id), [myDishes]);

  const cached = useMemo(
    () => loadCache(roomId, dishIds),
    [roomId, dishIds]
  );

  const [phase, setPhase] = useState<Phase>(() => {
    if (!cached) return "idle";
    const allRecipesCached = dishIds.every((id) => cached.recipesByDish[id]);
    if (allRecipesCached && dishIds.length > 0) return "cooking";
    if (Object.keys(cached.options).length) return "picking";
    return "idle";
  });

  const [dishOptions, setDishOptions] = useState<Record<string, RecipeOption[]>>(
    () => cached?.options ?? {}
  );
  const [dishOptionsError, setDishOptionsError] = useState<Record<string, string>>({});
  const [selections, setSelections] = useState<Record<string, number>>(
    () => cached?.selections ?? {}
  );
  const [dishRecipes, setDishRecipes] = useState<Record<string, RecipeResult>>(
    () => cached?.recipesByDish ?? {}
  );
  const [dishShoppingItems, setDishShoppingItems] = useState<Record<string, ShoppingItem[]>>(
    () => cached?.shoppingItemsByDish ?? {}
  );
  const [dishRecipeError, setDishRecipeError] = useState<Record<string, string>>({});

  // Track current ref of state for async callbacks that persist cache
  const stateRef = useRef({
    dishOptions,
    selections,
    dishRecipes,
    dishShoppingItems,
  });
  useEffect(() => {
    stateRef.current = {
      dishOptions,
      selections,
      dishRecipes,
      dishShoppingItems,
    };
  }, [dishOptions, selections, dishRecipes, dishShoppingItems]);

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

  const shoppingList = useMemo(
    () => aggregateShoppingItems(dishShoppingItems, dishIds),
    [dishShoppingItems, dishIds]
  );

  const allSelected = myDishes.every((d) => d.id in selections);
  const anyOptionsLoading = phase === "picking" && myDishes.some(
    (d) => !dishOptions[d.id] && !dishOptionsError[d.id]
  );
  const anyRecipeLoading = phase === "cooking" && myDishes.some(
    (d) => !dishRecipes[d.id] && !dishRecipeError[d.id]
  );
  const allRecipesReady = phase === "cooking" && myDishes.every((d) => dishRecipes[d.id]);

  const persist = useCallback(() => {
    const { dishOptions: o, selections: s, dishRecipes: r, dishShoppingItems: si } = stateRef.current;
    saveCache(roomId, {
      options: o,
      selections: s,
      servings,
      recipesByDish: r,
      shoppingItemsByDish: si,
      dishIds,
      generatedAt: new Date().toISOString(),
    });
  }, [roomId, servings, dishIds]);

  const fetchOptionsForDish = useCallback(
    async (dish: Food) => {
      setDishOptionsError((prev) => {
        if (!prev[dish.id]) return prev;
        const next = { ...prev };
        delete next[dish.id];
        return next;
      });
      try {
        const res = await fetch("/api/recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "generate-options-dish",
            dish: {
              title: dish.title,
              type: dish.type,
              servings: servings[dish.id],
              attributes: dish.attributes,
            },
            users: users.map((u) => ({
              name: u.name,
              dietaryRestrictions: u.dietaryRestrictions,
              dietaryNote: u.dietaryNote,
            })),
          }),
        });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const data = (await res.json()) as { options?: RecipeOption[] };
        const options = data.options;
        if (!options?.length) throw new Error("No options returned");
        setDishOptions((prev) => ({ ...prev, [dish.id]: options }));
        // Persist on next tick so state ref is up-to-date
        setTimeout(persist, 0);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        setDishOptionsError((prev) => ({ ...prev, [dish.id]: msg }));
      }
    },
    [servings, users, persist]
  );

  const fetchRecipeForDish = useCallback(
    async (dish: Food, recipeName: string) => {
      setDishRecipeError((prev) => {
        if (!prev[dish.id]) return prev;
        const next = { ...prev };
        delete next[dish.id];
        return next;
      });
      try {
        const res = await fetch("/api/recipes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "generate-recipe-dish",
            dishTitle: dish.title,
            recipeName,
            servings: servings[dish.id],
            dietaryAttributes: dish.attributes,
            users: users.map((u) => ({
              name: u.name,
              dietaryRestrictions: u.dietaryRestrictions,
              dietaryNote: u.dietaryNote,
            })),
          }),
        });
        if (!res.ok) {
          const body = await res.text();
          throw new Error(`API ${res.status}: ${body}`);
        }
        const fullText = await readStreamToString(res);
        const data = parseJsonLoose<{
          recipe?: RecipeResult;
          shoppingItems?: ShoppingItem[];
        }>(fullText);
        if (!data.recipe) throw new Error("Missing recipe in response");
        setDishRecipes((prev) => ({ ...prev, [dish.id]: data.recipe! }));
        setDishShoppingItems((prev) => ({
          ...prev,
          [dish.id]: data.shoppingItems ?? [],
        }));
        setTimeout(persist, 0);
      } catch (err) {
        console.error("Recipe generation failed for", dish.title, err);
        const msg = err instanceof Error ? err.message : String(err);
        setDishRecipeError((prev) => ({ ...prev, [dish.id]: msg }));
      }
    },
    [servings, users, persist]
  );

  const handleStart = useCallback(() => {
    setPhase("picking");
    setDishOptionsError({});
    setSelections({});
    setDishOptions({});
    for (const dish of myDishes) {
      void fetchOptionsForDish(dish);
    }
  }, [myDishes, fetchOptionsForDish]);

  const handleCook = useCallback(() => {
    setPhase("cooking");
    setDishRecipeError({});
    setDishRecipes({});
    setDishShoppingItems({});
    for (const dish of myDishes) {
      const idx = selections[dish.id];
      const option = dishOptions[dish.id]?.[idx];
      const recipeName = option?.name ?? dish.title;
      void fetchRecipeForDish(dish, recipeName);
    }
  }, [myDishes, selections, dishOptions, fetchRecipeForDish]);

  const handleSelect = useCallback(
    (dishId: string, idx: number) => {
      setSelections((prev) => {
        const next = { ...prev, [dishId]: idx };
        return next;
      });
      setTimeout(persist, 0);
    },
    [persist]
  );

  const handleReset = useCallback(() => {
    setPhase("idle");
    setDishOptions({});
    setDishOptionsError({});
    setSelections({});
    setDishRecipes({});
    setDishShoppingItems({});
    setDishRecipeError({});
    localStorage.removeItem(getCacheKey(roomId));
  }, [roomId]);

  const wizardRef = useRef<HTMLDivElement | null>(null);
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const [bannerVisible, setBannerVisible] = useState(true);

  useEffect(() => {
    if (phase !== "idle") {
      setBannerVisible(true);
      return;
    }
    const el = bannerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setBannerVisible(entry.isIntersecting),
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [phase]);

  const handleStickyTap = useCallback(() => {
    handleStart();
    requestAnimationFrame(() => {
      wizardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [handleStart]);

  const stickyVisible = phase === "idle" && !bannerVisible;
  // Reserve page bottom padding so the fixed CTA doesn't obscure content beneath it.
  useEffect(() => {
    if (!stickyVisible) return;
    document.body.classList.add("has-recipe-sticky-cta");
    return () => document.body.classList.remove("has-recipe-sticky-cta");
  }, [stickyVisible]);

  if (!currUser || myDishes.length === 0) return null;

  return (
    <div className="recipe-wizard" ref={wizardRef}>
      <AnimatePresence mode="wait" initial={false}>
        {phase === "idle" ? (
          <motion.div
            key="banner"
            ref={bannerRef}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <button className="recipe-banner" onClick={handleStart}>
              <div className="recipe-banner-visual">
                <span className="recipe-banner-emoji">👩‍🍳</span>
              </div>
              <div className="recipe-banner-content">
                <span className="recipe-banner-title">Ready to cook?</span>
                <span className="recipe-banner-subtitle">
                  Get recipes & a shopping list for your{" "}
                  {myDishes.length === 1 ? "dish" : `${myDishes.length} dishes`}
                </span>
              </div>
              <span className="recipe-banner-arrow">→</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="wizard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="recipe-picker-header">
              <h3 className="section-label">
                <span style={{ fontSize: "1.125rem" }}>📖</span>
                {phase === "picking" ? "Pick a recipe for each dish" : "Your recipes"}
                {phase === "picking" && anyOptionsLoading && (
                  <span className="recipe-header-status">generating options…</span>
                )}
                {phase === "cooking" && anyRecipeLoading && (
                  <span className="recipe-header-status">cooking up details…</span>
                )}
              </h3>
              <button className="btn-ghost recipe-reset-link" onClick={handleReset}>
                Start over
              </button>
            </div>

            <div className="recipe-dish-list">
              {myDishes.map((dish, i) => (
                <DishRow
                  key={dish.id}
                  dishTitle={dish.title}
                  dishIndex={i}
                  eligibleUsers={eligibilityMap[dish.id]?.eligible ?? []}
                  ineligibleUsers={eligibilityMap[dish.id]?.ineligible ?? []}
                  phase={phase}
                  options={dishOptions[dish.id]}
                  optionsError={dishOptionsError[dish.id]}
                  onRetryOptions={() => fetchOptionsForDish(dish)}
                  selectedIdx={selections[dish.id] ?? null}
                  onSelect={(idx) => handleSelect(dish.id, idx)}
                  recipe={dishRecipes[dish.id]}
                  recipeError={dishRecipeError[dish.id]}
                  onRetryRecipe={() => {
                    const idx = selections[dish.id];
                    const option = dishOptions[dish.id]?.[idx];
                    fetchRecipeForDish(dish, option?.name ?? dish.title);
                  }}
                />
              ))}
            </div>

            {phase === "picking" && (
              <AnimatePresence>
                {allSelected && !anyOptionsLoading && (
                  <motion.div
                    key="cta"
                    className="recipe-generate-cta"
                    initial={{ opacity: 0, y: 16, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: 16, height: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <button
                      className="btn btn-lg recipe-generate-btn"
                      onClick={handleCook}
                    >
                      Get my recipes & shopping list
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {phase === "cooking" && (shoppingList.length > 0 || allRecipesReady) && (
              <ShoppingList
                items={shoppingList}
                roomId={roomId}
                isLoading={anyRecipeLoading}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stickyVisible && (
          <motion.button
            key="sticky-cta"
            className="recipe-sticky-cta"
            onClick={handleStickyTap}
            initial={{ y: "120%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "120%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            aria-label="Get recipes and shopping list for your dishes"
          >
            <span className="recipe-sticky-cta-emoji" aria-hidden="true">👩‍🍳</span>
            <span className="recipe-sticky-cta-content">
              <span className="recipe-sticky-cta-title">Get recipes & shopping list</span>
              <span className="recipe-sticky-cta-subtitle">
                {myDishes.length === 1
                  ? "for your dish"
                  : `for your ${myDishes.length} dishes`}
              </span>
            </span>
            <span className="recipe-sticky-cta-arrow" aria-hidden="true">→</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
