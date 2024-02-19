'use client'
import { useAddData } from "@/firebase/firestore/addData";
import { nanoid } from 'nanoid'
import { useRouter } from "next/navigation";
import { Container, Button, Heading } from '@chakra-ui/react'
import dynamic from "next/dynamic";
const PreviousRoomsList = dynamic(() => import("@/components/PreviousRoomsList"), { ssr: false });

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

  const { addData, loading } = useAddData();
  const router = useRouter();

  const onNewRoomClick = async () => {
    const data = {
      users: [],
      foods: [],
    }
    const roomId = `${getFunSlug()}-${getFunSlug()}-${nanoid(5)}`;
    const { error } = await addData('rooms', roomId, data)

    if (error) {
      return console.error(error)
    } else {
      router.push(`/potlucks/${roomId}`);
    }
  }


  return (
    <main>
      <Container
        maxW="md"
        alignItems={"center"}
        display="flex"
        flexDirection={"column"}
      >
        <Heading as="h1" size="xl" mb={4}>
          Welcome to EZPotluck
        </Heading>
        <Heading as="h2" size="md" mb={6}>
          The easiest way to organize a potluck!
        </Heading>
        <Button onClick={onNewRoomClick} disabled={loading} mb={16}>
          {loading ? "loading" : "new potluck"}
        </Button>
        <PreviousRoomsList />
      </Container>
    </main>
  );
}
