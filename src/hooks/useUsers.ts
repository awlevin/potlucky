"use client";

import { useCallback, useMemo, useState } from "react";
import {
  joinRoomAction,
  leaveRoomAction,
  updateMemberAction,
} from "../../app/potlucks/[roomId]/actions";
import { useAuth } from "@/components/AuthProvider";
import type { DietaryRestriction, IRoomObj, User } from "@/types";

interface UseUsersProps {
  data: IRoomObj | null;
  roomId: string;
}

// In the Supabase world, identity is auth.user.id. The legacy hook used
// localStorage + nanoid; we keep the same return shape so the room page
// doesn't need a rewrite, but most operations now route through server
// actions and RLS does the gatekeeping.
export function useUsers({ data, roomId }: UseUsersProps) {
  const { user, isLoading: authLoading } = useAuth();
  const [userInput, setUserInput] = useState("");
  // Local optimistic snapshot for the user's own membership so the UI
  // dismisses the IdentityGate immediately after Join — without waiting
  // on the realtime channel to deliver the INSERT (which can lag or drop
  // during anonymous-auth handshakes). When the realtime catches up,
  // currUser falls through to the real row.
  const [optimisticSelf, setOptimisticSelf] = useState<User | null>(null);

  const realCurrUser: User | undefined = user
    ? data?.users?.find((u) => u.id === user.id)
    : undefined;

  const currUser = useMemo<User | undefined>(() => {
    if (realCurrUser) return realCurrUser;
    if (optimisticSelf && user && optimisticSelf.id === user.id)
      return optimisticSelf;
    return undefined;
  }, [realCurrUser, optimisticSelf, user]);

  // Resolved means: we know whether the visitor is a member yet.
  // - Signed-in member: yes, currUser is populated.
  // - Signed-in non-member: NO — we want to surface the IdentityGate so
  //   they can pick a display name and join.
  // - Signed-out: NO — IdentityGate prompts sign-in.
  // - Auth still loading: NO — wait for auth to resolve before deciding.
  const identityResolved = !authLoading && Boolean(currUser);

  const createAndSelectIdentity = useCallback(
    async (
      name: string,
      dietaryRestrictions?: DietaryRestriction[],
      dietaryNote?: string
    ) => {
      if (!user) return;
      await joinRoomAction(roomId, { displayName: name });
      // Optimistic seed so the gate dismisses now; the real row arrives
      // via realtime / next refetch and replaces this stub.
      setOptimisticSelf({
        id: user.id,
        name,
        ...(dietaryRestrictions?.length ? { dietaryRestrictions } : {}),
        ...(dietaryNote ? { dietaryNote } : {}),
      });
      if (dietaryRestrictions?.length || dietaryNote) {
        await updateMemberAction(roomId, {
          dietaryRestrictions: dietaryRestrictions ?? [],
          dietaryNote: dietaryNote ?? null,
        });
      }
    },
    [user, roomId]
  );

  // Existing-user picker — no longer applicable; identity is the signed-in user.
  // Kept as a no-op so the page component's prop signature is unchanged.
  const selectIdentity = useCallback((_user: User) => {}, []);

  const updateDietary = useCallback(
    async (
      dietaryRestrictions: DietaryRestriction[],
      dietaryNote?: string
    ) => {
      if (!currUser) return;
      await updateMemberAction(roomId, {
        dietaryRestrictions,
        dietaryNote: dietaryNote ?? null,
      });
    },
    [currUser, roomId]
  );

  const switchIdentity = useCallback(async () => {
    // Switching identity now means signing out — Supabase identity is
    // the auth user. The room page can prompt re-sign-in.
    if (typeof window !== "undefined") {
      await fetch("/auth/sign-out", { method: "POST" });
      window.location.reload();
    }
  }, []);

  const removeUser = useCallback(
    async (id: string) => {
      // Self-leave only for now. Host-evict can come later via a separate action.
      if (currUser?.id !== id) return;
      await leaveRoomAction(roomId);
    },
    [currUser, roomId]
  );

  const addUser = useCallback(async () => {
    if (!user || !userInput.trim()) return;
    const name = userInput.trim();
    setUserInput("");
    await joinRoomAction(roomId, { displayName: name });
  }, [user, userInput, roomId]);

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
    updateDietary,
  };
}
