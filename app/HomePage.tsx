"use client";
import { useAddData } from "@/lib/firebase/firestore/addData";
import { nanoid } from 'nanoid'
import { useRouter } from "next/navigation";
import { Container, Heading } from '@chakra-ui/react'
import dynamic from "next/dynamic";
import { useState } from "react";
import HowItWorks from "@/components/HowItWorks";
import { HeroSection } from "@/components/HeroSection";
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

  const onNewRoomClick = async () => {
    const data = {
      users: [],
      foods: [],
    }
    const roomId = `${getFunSlug()}-${getFunSlug()}-${nanoid(5)}`;
    setLoading(true);
    const { error } = await addData('rooms', roomId, data)

    if (error) {
      return console.error(error)
    } else {
      router.push(`/potlucks/${roomId}`)
    }
    setTimeout(() => {
      // this is pretty jank and i'm pretty sure will cause errors if this stuff has unmounted when it gets called after the page re-routes
      // ... but it fixes the flickery loading state
      setLoading(false);
    }, 3000)
  }


  return (
    <main>
      <HeroSection onStart={onNewRoomClick} loading={loading} />

      <HowItWorks />

      <Container
        maxW="md"
        alignItems={"center"}
        display="flex"
        flexDirection={"column"}
        py={8}
      >
        <Heading as="h3" size="md" mb={4}>
          Previous Potlucks
        </Heading>
        <PreviousRoomsList />
      </Container>
    </main>
  );
}
