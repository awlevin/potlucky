"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import { useAddData } from "@/lib/firebase/firestore/addData";
import { presetToFoods, PotluckPreset } from "@/data/presets";

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

const getFunSlug = () =>
  FUN_SLUGS[Math.floor(Math.random() * FUN_SLUGS.length)];

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
  const [loading, setLoading] = useState(false);
  const { addData } = useAddData();
  const router = useRouter();

  const createRoom = async () => {
    const foods = presetToFoods(preset);
    const data = {
      users: [],
      foods,
      ...(preset.name ? { name: preset.name } : {}),
      ...(preset.date ? { date: preset.date } : {}),
    };
    const roomId = `${getFunSlug()}-${getFunSlug()}-${nanoid(5)}`;
    setLoading(true);
    const { error } = await addData("rooms", roomId, data);
    if (error) {
      setLoading(false);
      return console.error(error);
    }
    router.push(`/potlucks/${roomId}`);
  };

  const text =
    label ?? `Start a ${preset.name} potluck${loading ? "…" : ""}`;

  return (
    <button
      type="button"
      className={size === "lg" ? "btn btn-lg" : "btn"}
      onClick={createRoom}
      disabled={loading}
    >
      {loading ? "Creating…" : text}
    </button>
  );
}
