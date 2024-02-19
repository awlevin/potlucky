import { useLocalStorage } from "@uidotdev/usehooks";
import { useRouter } from "next/navigation";
import { Button, Heading, List, ListItem } from '@chakra-ui/react'
import { IPrevRoom } from "@/utils/misc";

export const PreviousRoomsList = () => {
  const [prevRooms] = useLocalStorage<IPrevRoom[]>("prevRooms", []);
  const router = useRouter();

  return (
    prevRooms.length > 0 && (
      <>
        <Heading as="h3" size="md" mb={4}>
          Previous Rooms
        </Heading>
        <List>
          {prevRooms.map((room) => (
            <ListItem key={room.id}>
              <Button
                onClick={() => router.push(`/potlucks/${room.id}`)}
                size={"xs"}
              >
                {room.name}
              </Button>
            </ListItem>
          ))}
        </List>
      </>
    )
  );
};

// doing default export so next/dynamic will stop complaining
export default PreviousRoomsList;