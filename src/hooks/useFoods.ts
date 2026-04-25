"use client";

import { useCallback, useState } from "react";
import {
  addFoodAction,
  claimFoodAction,
  removeFoodAction,
  unclaimFoodAction,
} from "../../app/potlucks/[roomId]/actions";
import { toaster } from "@/components/ui/toaster";
import type { Food, IRoomObj } from "@/types";

interface UseFoodsProps {
  data: IRoomObj | null;
  currUser: IRoomObj["users"][0] | undefined;
  roomId: string;
  hasClaimedFoodBefore: boolean;
  setHasClaimedFoodBefore: (value: boolean) => void;
}

export function useFoods({
  data,
  currUser,
  roomId,
  hasClaimedFoodBefore,
  setHasClaimedFoodBefore,
}: UseFoodsProps) {
  const [foodInput, setFoodInput] = useState("");

  const addFood = useCallback(
    async (
      type?: Food["type"],
      attributes?: Food["attributes"],
      notes?: string
    ) => {
      const title = foodInput.trim();
      if (!title) return;
      setFoodInput("");
      await addFoodAction(roomId, {
        title,
        type: type ?? null,
        notes: notes ?? null,
        attributes: attributes ?? [],
      });
    },
    [foodInput, roomId]
  );

  const addFoodDirect = useCallback(
    async (title: string, type?: Food["type"]) => {
      const t = title.trim();
      if (!t) return;
      await addFoodAction(roomId, { title: t, type: type ?? null });
    },
    [roomId]
  );

  const removeFood = useCallback(
    async (id: string) => {
      await removeFoodAction(roomId, id);
    },
    [roomId]
  );

  const claimFood = useCallback(
    async (id: string) => {
      if (!currUser) {
        toaster.create({ description: "Sign in to claim a dish.", type: "error" });
        return;
      }
      const food = data?.foods?.find((f) => f.id === id);
      if (!food) return;

      const claimers = Array.isArray(food.claimedBy)
        ? food.claimedBy
        : food.claimedBy
        ? [food.claimedBy]
        : [];
      const alreadyMine = claimers.includes(currUser.id);

      // Single-claim semantics in Supabase: a dish can have at most one
      // claimer. If someone else has it, do nothing (the FoodList button
      // should be visually disabled).
      if (claimers.length > 0 && !alreadyMine) {
        toaster.create({
          description: "Already claimed by someone else.",
          type: "info",
        });
        return;
      }

      if (alreadyMine) {
        await unclaimFoodAction(roomId, id);
      } else {
        await claimFoodAction(roomId, id);
        if (!hasClaimedFoodBefore) setHasClaimedFoodBefore(true);
      }
    },
    [currUser, data?.foods, hasClaimedFoodBefore, setHasClaimedFoodBefore, roomId]
  );

  return {
    foodInput,
    setFoodInput,
    addFood,
    addFoodDirect,
    removeFood,
    claimFood,
  };
}
