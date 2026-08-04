"use server";

import { redirect } from "next/navigation";
import { nanoid } from "nanoid";
import { createServerSupabase } from "@/lib/supabase/server";
import { SupabaseRoomRepository } from "@/lib/data/supabase-repository";
import { NotAuthenticatedError, type AddFoodInput } from "@/lib/data";

const FUN_SLUGS = [
  "pumpkin",
  "pleasant",
  "cheesy",
  "baked",
  "milky",
  "oily",
  "smooth",
  "plump",
];

function funSlug() {
  return FUN_SLUGS[Math.floor(Math.random() * FUN_SLUGS.length)];
}

function newRoomId() {
  return `${funSlug()}-${funSlug()}-${nanoid(5)}`;
}

export type CreateRoomInput = {
  name?: string;
  date?: string;
  presetFoods?: AddFoodInput[];
};

// Creates a room owned by the caller and seeds the host's membership.
// Anonymous users get redirected to sign-in with `next` set to bring them
// back through this action after auth.
export async function createRoomAction(input: CreateRoomInput) {
  const supabase = createServerSupabase();
  const { data: userResult } = await supabase.auth.getUser();
  if (!userResult.user) {
    redirect("/auth/sign-in?next=/&intent=create-room");
  }

  const repo = new SupabaseRoomRepository(supabase);
  const id = newRoomId();
  const name = input.name?.trim() || "Untitled Potluck";

  await repo.createRoom({ id, name });

  if (input.date) {
    await repo.updateRoomMetadata(id, { date: input.date });
  }

  if (input.presetFoods?.length) {
    for (const food of input.presetFoods) {
      try {
        await repo.addFood(id, food);
      } catch (err) {
        // Don't fail room creation on a single bad preset food.
        console.error("[createRoomAction] preset food insert failed", err);
      }
    }
  }

  redirect(`/potlucks/${id}`);
}

export async function createRoomAndJoinAction(
  input: CreateRoomInput & { displayName: string }
) {
  const supabase = createServerSupabase();
  const { data: userResult } = await supabase.auth.getUser();
  if (!userResult.user) throw new NotAuthenticatedError();

  const repo = new SupabaseRoomRepository(supabase);
  const id = newRoomId();
  const name = input.name?.trim() || "Untitled Potluck";

  await repo.createRoom({ id, name });
  await repo.joinRoom(id, {
    displayName: input.displayName,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
  });

  if (input.date) {
    await repo.updateRoomMetadata(id, { date: input.date });
  }
  if (input.presetFoods?.length) {
    for (const food of input.presetFoods) {
      try {
        await repo.addFood(id, food);
      } catch (err) {
        console.error("[createRoomAndJoin] preset food insert failed", err);
      }
    }
  }

  redirect(`/potlucks/${id}`);
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
