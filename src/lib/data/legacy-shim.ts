// Translates the new domain types (PublicRoom / Room / RoomMember / RoomFood)
// to the legacy IRoomObj shape that the existing UI components expect. This
// keeps the cutover blast radius small — components stay on IRoomObj while
// the data layer flips to Supabase.
//
// Drop this file after the components are refactored to consume PublicRoom
// directly.

import type { Food, IRoomObj, User } from "@/types";
import type { PublicRoom, Room, RoomFood, RoomMember } from "./types";

function memberToUser(m: RoomMember): User {
  return {
    id: m.userId,
    name: m.displayName,
    color: m.color,
    dateJoined: new Date(m.joinedAt),
    lastActive: new Date(m.lastActive),
    isActive: true,
    ...(m.dietaryRestrictions.length
      ? { dietaryRestrictions: m.dietaryRestrictions }
      : {}),
    ...(m.dietaryNote ? { dietaryNote: m.dietaryNote } : {}),
  };
}

function foodToLegacy(f: RoomFood): Food {
  return {
    id: f.id,
    title: f.title,
    ...(f.notes ? { notes: f.notes } : {}),
    ...(f.type ? { type: f.type } : {}),
    ...(f.attributes.length ? { attributes: f.attributes } : {}),
    ...(f.claimedBy ? { claimedBy: f.claimedBy } : {}),
  };
}

export function publicRoomToLegacy(room: PublicRoom | Room): IRoomObj {
  const hostIds = room.members.filter((m) => m.isHost).map((m) => m.userId);
  return {
    id: room.id,
    name: room.name,
    ...(room.date ? { date: room.date } : {}),
    ...("location" in room && room.location
      ? { location: room.location }
      : {}),
    users: room.members.map(memberToUser),
    foods: room.foods.map(foodToLegacy),
    ...(hostIds.length ? { hostIds } : {}),
  };
}
