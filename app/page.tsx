'use client'
import { useAddData } from "@/firebase/firestore/addData";
import { nanoid } from 'nanoid'
import { useRouter } from "next/navigation";
import { Container, Button, Heading, List, ListItem } from '@chakra-ui/react'
import { useLocalStorage } from "@uidotdev/usehooks";
import { IPrevRoom } from "./potlucks/[roomId]/page";

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
    const { result, error } = await addData('rooms', roomId, data)
    console.log({ result, error })

    if (error) {
      return console.error(error)
    } else {
      router.push(`/potlucks/${roomId}`);
    }
  }

  const [prevRooms] = useLocalStorage<IPrevRoom[]>("prevRooms", []);

  return (
    <main>
      <Container
        maxW="md"
        marginTop={16}
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
        {prevRooms.length > 0 && (
          <>
            <Heading as="h3" size="md" mb={4}>
              Previous Rooms
            </Heading>
            <List>
              <ListItem>
                {prevRooms.map((room) => (
                  <ListItem key={room.id}>
                    <Button onClick={() => router.push(`/potlucks/${room.id}`)} size={"xs"}>
                      {room.name}
                    </Button>
                  </ListItem>
                ))}
              </ListItem>
            </List>
          </>
        )}
      </Container>
    </main>
  );
}
