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

  const addFood = async (type?: Food["type"], notes?: string) => {
    setFoodInput("");
    await addData({
      ...data,
      foods: [
        ...(data?.foods || []),
        {
          id: nanoid(5),
          title: foodInput,
          ...(type ? { type } : {}),
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

  const claimFood = (id: string) => {
    if (!currUser) {
      toaster.create({
        description: "Pick a user first!",
        type: "error",
        // isClosable: true,
      });
      return;
    }

    const newFoods = modifyItemById(data?.foods || [], id, (food) => {
      return {
        ...food,
        claimedBy: food.claimedBy === currUser.id ? null : currUser.id,
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
    claimFood,
  };
} 