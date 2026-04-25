"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabase/server";
import { SupabaseRoomRepository } from "@/lib/data/supabase-repository";
import {
  NotAuthenticatedError,
  type AddFoodInput,
  type RoomMetadataPatch,
  type UpdateMemberInput,
} from "@/lib/data";

function repo() {
  return new SupabaseRoomRepository(createServerSupabase());
}

async function requireUser() {
  const supabase = createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new NotAuthenticatedError();
  return data.user;
}

export async function updateRoomMetadataAction(
  roomId: string,
  patch: RoomMetadataPatch
) {
  await requireUser();
  await repo().updateRoomMetadata(roomId, patch);
  revalidatePath(`/potlucks/${roomId}`);
}

export async function joinRoomAction(
  roomId: string,
  input: { displayName: string; color?: string }
) {
  await requireUser();
  const color = input.color ?? randomColor();
  await repo().joinRoom(roomId, { displayName: input.displayName, color });
  revalidatePath(`/potlucks/${roomId}`);
}

export async function updateMemberAction(roomId: string, patch: UpdateMemberInput) {
  await requireUser();
  await repo().updateMember(roomId, patch);
  revalidatePath(`/potlucks/${roomId}`);
}

export async function leaveRoomAction(roomId: string) {
  await requireUser();
  await repo().leaveRoom(roomId);
  revalidatePath(`/potlucks/${roomId}`);
}

export async function addFoodAction(roomId: string, input: AddFoodInput) {
  await requireUser();
  await repo().addFood(roomId, input);
  revalidatePath(`/potlucks/${roomId}`);
}

export async function updateFoodAction(
  roomId: string,
  foodId: string,
  patch: Partial<AddFoodInput>
) {
  await requireUser();
  await repo().updateFood(roomId, foodId, patch);
  revalidatePath(`/potlucks/${roomId}`);
}

export async function removeFoodAction(roomId: string, foodId: string) {
  await requireUser();
  await repo().removeFood(roomId, foodId);
  revalidatePath(`/potlucks/${roomId}`);
}

export async function claimFoodAction(roomId: string, foodId: string) {
  await requireUser();
  await repo().claimFood(roomId, foodId);
  revalidatePath(`/potlucks/${roomId}`);
}

export async function unclaimFoodAction(roomId: string, foodId: string) {
  await requireUser();
  await repo().unclaimFood(roomId, foodId);
  revalidatePath(`/potlucks/${roomId}`);
}

// Convenience action: apply a preset (sets name/date if not already set,
// inserts a batch of foods). Used by PresetPicker when an empty room
// applies one of the canonical templates.
export async function applyPresetAction(
  roomId: string,
  input: { foods?: AddFoodInput[]; name?: string; date?: string }
) {
  await requireUser();
  const r = repo();
  const meta: RoomMetadataPatch = {};
  if (input.name !== undefined) meta.name = input.name;
  if (input.date !== undefined) meta.date = input.date;
  if (Object.keys(meta).length) await r.updateRoomMetadata(roomId, meta);
  if (input.foods?.length) {
    for (const food of input.foods) {
      try {
        await r.addFood(roomId, food);
      } catch (err) {
        console.error("[applyPresetAction] food insert failed", err);
      }
    }
  }
  revalidatePath(`/potlucks/${roomId}`);
}

const COLORS = [
  "#E8A817",
  "#4EA24E",
  "#D4502E",
  "#7C5BC4",
  "#2C8AB8",
  "#C84B85",
  "#8B6F47",
  "#3F8C6E",
];
function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}
