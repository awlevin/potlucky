"use client";

import { useAuth } from "@/components/AuthProvider";
import type { PublicRoom } from "@/lib/data";

export type Membership = {
  isMember: boolean;
  isHost: boolean;
};

export function useRoomMembership(room: PublicRoom | null): Membership {
  const { user } = useAuth();
  if (!user || !room) return { isMember: false, isHost: false };
  const me = room.members.find((m) => m.userId === user.id);
  return {
    isMember: Boolean(me),
    isHost: Boolean(me?.isHost),
  };
}
