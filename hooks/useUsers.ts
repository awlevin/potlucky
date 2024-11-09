import { useState } from "react";
import { nanoid } from "nanoid";
import { User, IRoomObj } from "@/types";

interface UseUsersProps {
  data: IRoomObj | null;
  addData: (data: Partial<IRoomObj>) => Promise<void>;
}

export function useUsers({ data, addData }: UseUsersProps) {
  const [userInput, setUserInput] = useState("");
  const [hasClaimedUserBefore, setHasClaimedUserBefore] = useState(false);
  const [currUser, setCurrUser] = useState<IRoomObj["users"][0]>();

  const claimUser = (id: string) => {
    setHasClaimedUserBefore(true);
    if (currUser?.id === id) {
      setCurrUser(undefined);
    } else {
      const foundUser = data?.users?.find((u) => u.id === id);
      setCurrUser(foundUser);
    }
  };

  const removeUser = async (id: string) => {
    if (currUser?.id === id) {
      setCurrUser(undefined);
    }
    await addData({
      ...data,
      users: data?.users?.filter((u) => u.id !== id),
      foods: data?.foods?.map((food) => {
        if (food.claimedBy === id) {
          return { ...food, claimedBy: null };
        }
        return food;
      }),
    });
  };

  const addUser = async () => {
    setUserInput("");
    await addData({
      ...data,
      users: [
        ...(data?.users || []),
        { id: nanoid(5), name: userInput } as User,
      ],
    });
  };

  return {
    userInput,
    setUserInput,
    hasClaimedUserBefore,
    currUser,
    claimUser,
    removeUser,
    addUser,
  };
} 