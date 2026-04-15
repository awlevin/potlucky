"use client";
import { useAddData } from "@/lib/firebase/firestore/addData";
import { nanoid } from 'nanoid'
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import HowItWorks from "@/components/HowItWorks";
import { HeroSection } from "@/components/HeroSection";
import { PresetCards } from "@/components/PresetCards";
import { getUpcomingPresets, presetToFoods, PotluckPreset } from "@/data/presets";

const PreviousRoomsList = dynamic(
  () => import("@/components/PreviousRoomsList"),
  { ssr: false, loading: () => <div /> }
);

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

const getFunSlug = () => FUN_SLUGS[Math.floor(Math.random() * FUN_SLUGS.length)];

export default function Home() {

  const [loading, setLoading] = useState(false);
  const { addData } = useAddData();
  const router = useRouter();
  const upcomingPresets = useMemo(() => getUpcomingPresets(), []);

  const createRoom = async (preset?: PotluckPreset) => {
    const foods = preset ? presetToFoods(preset) : [];
    const data = {
      users: [],
      foods,
      ...(preset?.name ? { name: preset.name } : {}),
      ...(preset?.date ? { date: preset.date } : {}),
    };
    const roomId = `${getFunSlug()}-${getFunSlug()}-${nanoid(5)}`;
    setLoading(true);
    const { error } = await addData('rooms', roomId, data);

    if (error) {
      return console.error(error);
    } else {
      router.push(`/potlucks/${roomId}`);
    }
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  };


  return (
    <main>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <HeroSection onStart={() => createRoom()} loading={loading} />

        <PresetCards
          presets={upcomingPresets}
          onSelect={(preset) => createRoom(preset)}
          loading={loading}
        />

        <HowItWorks />

        <PreviousRoomsList />
      </motion.div>
    </main>
  );
}
