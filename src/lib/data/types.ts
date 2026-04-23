import type { DietaryRestriction } from "@/types";

export type RoomMember = {
  userId: string;
  displayName: string;
  color: string;
  isHost: boolean;
  dietaryRestrictions: DietaryRestriction[];
  dietaryNote: string | null;
  joinedAt: string;
  lastActive: string;
};

export type FoodType = "appetizer" | "main" | "side" | "dessert" | "drink";

export type RoomFood = {
  id: string;
  title: string;
  notes: string | null;
  type: FoodType | null;
  attributes: DietaryRestriction[];
  claimedBy: string | null;
  createdBy: string;
};

export type PublicRoom = {
  id: string;
  name: string;
  date: string | null;
  createdBy: string;
  createdAt: string;
  closedAt: string | null;
  members: RoomMember[];
  foods: RoomFood[];
};

// Only populated when the caller is a room member. RLS enforces this.
export type Room = PublicRoom & {
  location: string | null;
};

export type RoomMetadataPatch = {
  name?: string;
  date?: string | null;
  location?: string | null;
};

export type AddFoodInput = {
  title: string;
  notes?: string | null;
  type?: FoodType | null;
  attributes?: DietaryRestriction[];
};

export type UpdateMemberInput = {
  displayName?: string;
  color?: string;
  dietaryRestrictions?: DietaryRestriction[];
  dietaryNote?: string | null;
};

export type JoinRoomInput = {
  displayName: string;
  color: string;
};

export type CreateRoomInput = {
  id: string;
  name: string;
};

export type Unsubscribe = () => void;
