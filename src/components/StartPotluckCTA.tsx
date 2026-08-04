"use client";

import { useTransition } from "react";
import { presetToFoods, PotluckPreset } from "@/data/presets";
import { createRoomAction } from "../../app/actions";

interface StartPotluckCTAProps {
  preset: PotluckPreset;
  label?: string;
  size?: "lg" | "md";
}

export function StartPotluckCTA({
  preset,
  label,
  size = "lg",
}: StartPotluckCTAProps) {
  const [pending, startTransition] = useTransition();

  const createRoom = () => {
    const presetFoods = presetToFoods(preset).map((f) => ({
      title: f.title,
      type: f.type ?? null,
      notes: f.notes ?? null,
      attributes: f.attributes ?? [],
    }));
    startTransition(async () => {
      await createRoomAction({
        ...(preset.name ? { name: preset.name } : {}),
        ...(preset.date ? { date: preset.date } : {}),
        presetFoods,
      });
      // createRoomAction either redirects to the new room (success) or to
      // /auth/sign-in?intent=create-room (anonymous). Either way the
      // navigation happens server-side; no client routing needed.
    });
  };

  const text = label ?? `Start a ${preset.name} potluck`;

  return (
    <button
      type="button"
      className={size === "lg" ? "btn btn-lg" : "btn"}
      onClick={createRoom}
      disabled={pending}
    >
      {pending ? "Creating…" : text}
    </button>
  );
}
