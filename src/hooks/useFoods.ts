import { useState } from "react";
import { nanoid } from "nanoid";
import { Food, IRoomObj } from "@/types";
import { modifyItemById } from "@/utils/modifyItemById";
import { toaster } from "@/components/ui/toaster";

interface UseFoodsProps {
  data: IRoomObj | null;
  addData: (data: Partial<IRoomObj>) => Promise<void>;
  currUser: IRoomObj["users"][0] | undefined;
  hasClaimedFoodBefore: boolean;
  setHasClaimedFoodBefore: (value: boolean) => void;
}

export function useFoods({
  data,
  addData,
  currUser,
  hasClaimedFoodBefore,
  setHasClaimedFoodBefore,
}: UseFoodsProps) {
  const [foodInput, setFoodInput] = useState("");

  const addFood = async (type?: Food["type"], attributes?: Food["attributes"], notes?: string) => {
    setFoodInput("");
    await addData({
      ...data,
      foods: [
        ...(data?.foods || []),
        {
          id: nanoid(5),
          title: foodInput,
          ...(type ? { type } : {}),
          ...(attributes && attributes.length > 0 ? { attributes } : {}),
          ...(notes ? { notes } : {}),
        } as Food,
      ],
    });
  };

  const addFoodDirect = async (title: string, type?: Food["type"]) => {
    await addData({
      ...data,
      foods: [
        ...(data?.foods || []),
        { id: nanoid(5), title, ...(type ? { type } : {}) } as Food,
      ],
    });
  };

  const removeFood = async (id: string) => {
    await addData({
      ...data,
      foods: data?.foods?.filter((food) => food.id !== id),
    });
  };

  const updateFood = async (id: string, patch: Partial<Pick<Food, "type" | "attributes" | "notes" | "title">>) => {
    const next = modifyItemById(data?.foods || [], id, (food) => {
      const merged: Food = { ...food, ...patch };
      if (Array.isArray(merged.attributes) && merged.attributes.length === 0) {
        delete merged.attributes;
      }
      if (typeof merged.notes === "string" && merged.notes.trim() === "") {
        delete merged.notes;
      }
      return merged;
    });
    await addData({ ...data, foods: next });
  };

  const claimFood = (id: string) => {
    if (!currUser) {
      toaster.create({
        description: "Pick a user first!",
        type: "error",
      });
      return;
    }

    const newFoods = modifyItemById(data?.foods || [], id, (food) => {
      // Normalize claimedBy to array
      const current = Array.isArray(food.claimedBy)
        ? food.claimedBy
        : food.claimedBy
        ? [food.claimedBy]
        : [];

      const alreadyClaimed = current.includes(currUser.id);
      const updated = alreadyClaimed
        ? current.filter((uid: string) => uid !== currUser.id)
        : [...current, currUser.id];

      return {
        ...food,
        claimedBy: updated.length === 0 ? null : updated,
      };
    });

    if (!hasClaimedFoodBefore) {
      setHasClaimedFoodBefore(true);
    }
    addData({
      ...data,
      foods: newFoods,
    });
  };

  return {
    foodInput,
    setFoodInput,
    addFood,
    addFoodDirect,
    removeFood,
    updateFood,
    claimFood,
  };
} 