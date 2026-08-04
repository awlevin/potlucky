"use client";
import dynamic from "next/dynamic";
import { useMemo, useTransition } from "react";
import { motion } from "framer-motion";
import HowItWorks from "@/components/HowItWorks";
import { HeroSection } from "@/components/HeroSection";
import { PresetCards } from "@/components/PresetCards";
import { getUpcomingPresets, presetToFoods, PotluckPreset } from "@/data/presets";
import { createRoomAction } from "./actions";

const PreviousRoomsList = dynamic(
  () => import("@/components/PreviousRoomsList"),
  { ssr: false, loading: () => <div /> }
);

export default function Home() {
  const [pending, startTransition] = useTransition();
  const upcomingPresets = useMemo(() => getUpcomingPresets(), []);

  const createRoom = (preset?: PotluckPreset) => {
    const presetFoods = preset
      ? presetToFoods(preset).map((f) => ({
          title: f.title,
          type: f.type ?? null,
          notes: f.notes ?? null,
          attributes: f.attributes ?? [],
        }))
      : [];
    startTransition(async () => {
      await createRoomAction({
        ...(preset?.name ? { name: preset.name } : {}),
        ...(preset?.date ? { date: preset.date } : {}),
        presetFoods,
      });
      // Server action handles redirect (to the new room or to sign-in).
    });
  };

  return (
    <main>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <HeroSection onStart={() => createRoom()} loading={pending} />

        <PresetCards
          presets={upcomingPresets}
          onSelect={(preset) => createRoom(preset)}
          loading={pending}
        />

        <HowItWorks />

        <PreviousRoomsList />
      </motion.div>
    </main>
  );
}
