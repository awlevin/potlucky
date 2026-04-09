import { useState, useEffect, useCallback } from "react";
import { nanoid } from "nanoid";
import { User, IRoomObj } from "@/types";

interface UseUsersProps {
  data: IRoomObj | null;
  addData: (data: Partial<IRoomObj>) => Promise<void>;
  roomId: string;
}

function getStorageKey(roomId: string) {
  return `potlucky-identity-${roomId}`;
}

function loadIdentity(roomId: string): { id: string; name: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(getStorageKey(roomId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.id === "string" && typeof parsed.name === "string") {
      return parsed;
    }
  } catch {
    // corrupted data
  }
  return null;
}

function saveIdentity(roomId: string, user: { id: string; name: string }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStorageKey(roomId), JSON.stringify(user));
}

function clearIdentity(roomId: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(getStorageKey(roomId));
}

export function useUsers({ data, addData, roomId }: UseUsersProps) {
  const [userInput, setUserInput] = useState("");
  const [currUser, setCurrUser] = useState<User | undefined>(undefined);
  // Whether the identity gate has been resolved (user picked or switched)
  const [identityResolved, setIdentityResolved] = useState(false);

  // On mount (or when data arrives), try to restore identity from localStorage
  useEffect(() => {
    if (!data || identityResolved) return;

    const saved = loadIdentity(roomId);
    if (saved) {
      // Verify the user still exists in the room
      const found = data.users?.find((u) => u.id === saved.id);
      if (found) {
        setCurrUser(found);
        setIdentityResolved(true);
      } else {
        // User was removed from room — clear stale identity
        clearIdentity(roomId);
      }
    }
  }, [data, roomId, identityResolved]);

  // Select an existing user as identity
  const selectIdentity = useCallback(
    (user: User) => {
      setCurrUser(user);
      saveIdentity(roomId, { id: user.id, name: user.name });
      setIdentityResolved(true);
    },
    [roomId]
  );

  // Create a new user, add to room, and set as identity
  const createAndSelectIdentity = useCallback(
    async (name: string) => {
      const newUser: User = { id: nanoid(5), name };
      await addData({
        ...data,
        users: [...(data?.users || []), newUser],
      });
      setCurrUser(newUser);
      saveIdentity(roomId, { id: newUser.id, name: newUser.name });
      setIdentityResolved(true);
    },
    [data, addData, roomId]
  );

  // Switch identity (reset and show gate again)
  const switchIdentity = useCallback(() => {
    setCurrUser(undefined);
    clearIdentity(roomId);
    setIdentityResolved(false);
  }, [roomId]);

  const removeUser = async (id: string) => {
    if (currUser?.id === id) {
      setCurrUser(undefined);
      clearIdentity(roomId);
      setIdentityResolved(false);
    }
    await addData({
      ...data,
      users: data?.users?.filter((u) => u.id !== id),
      foods: data?.foods?.map((food) => {
        if (Array.isArray(food.claimedBy)) {
          const filtered = food.claimedBy.filter((uid) => uid !== id);
          return { ...food, claimedBy: filtered.length === 0 ? null : filtered };
        }
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
    currUser,
    identityResolved,
    selectIdentity,
    createAndSelectIdentity,
    switchIdentity,
    removeUser,
    addUser,
  };
}
