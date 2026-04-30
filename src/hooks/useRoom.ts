"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRepository } from "@/components/RepositoryProvider";
import {
  NotAMemberError,
  type PublicRoom,
  type Room,
} from "@/lib/data";
import { useAuth } from "@/components/AuthProvider";

export type UseRoomResult = {
  room: PublicRoom | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

export function useRoom(roomId: string | null): UseRoomResult {
  const repo = useRepository();
  const [room, setRoom] = useState<PublicRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // Track the current roomId without re-creating refetch on every change so
  // mutation hooks can keep a stable callback in their dependency arrays.
  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;

  const refetch = useCallback(async () => {
    const id = roomIdRef.current;
    if (!id) return;
    try {
      const r = await repo.getRoom(id);
      setRoom(r);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [repo]);

  useEffect(() => {
    if (!roomId) {
      setRoom(null);
      setLoading(false);
      return;
    }
    let mounted = true;
    setLoading(true);

    repo
      .getRoom(roomId)
      .then((r) => {
        if (!mounted) return;
        setRoom(r);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    // Realtime subscription — best-effort sync from other tabs / devices.
    // The local user's own mutations don't depend on this; they explicitly
    // refetch after each server action via the refetch callback returned
    // by this hook.
    const unsubscribe = repo.subscribeToRoom(roomId, (next) => {
      if (mounted) setRoom(next);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [roomId, repo]);

  return { room, loading, error, refetch };
}

export type UseRoomWithLocationResult = {
  room: Room | null;
  loading: boolean;
  error: Error | null;
  notAMember: boolean;
};

// Fetches the full room including `location`. Returns notAMember=true when
// the user is authenticated but not a member — the UI should show a
// "join this potluck to see the location" affordance rather than an error.
export function useRoomWithLocation(
  roomId: string | null
): UseRoomWithLocationResult {
  const repo = useRepository();
  const { user, isLoading: authLoading } = useAuth();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [notAMember, setNotAMember] = useState(false);

  useEffect(() => {
    if (!roomId || authLoading) {
      return;
    }
    if (!user) {
      setRoom(null);
      setLoading(false);
      setNotAMember(false);
      return;
    }
    let mounted = true;
    setLoading(true);

    repo
      .getRoomWithLocation(roomId)
      .then((r) => {
        if (!mounted) return;
        setRoom(r);
        setNotAMember(false);
        setError(null);
      })
      .catch((err) => {
        if (!mounted) return;
        if (err instanceof NotAMemberError) {
          setNotAMember(true);
          setRoom(null);
          setError(null);
        } else {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [roomId, repo, user, authLoading]);

  return { room, loading, error, notAMember };
}
