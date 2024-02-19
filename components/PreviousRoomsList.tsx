import { useLocalStorage } from "@uidotdev/usehooks";
import { useRouter } from "next/navigation";
import { Button, List, ListItem, Text } from '@chakra-ui/react'
import { IPrevRoom } from "@/utils/misc";

export const PreviousRoomsList = () => {
  const [prevRooms] = useLocalStorage<IPrevRoom[]>("prevRooms", []);
  const router = useRouter();

  return prevRooms.length > 0 ? (
    <>
      <List>
        {prevRooms.reverse().map((room) => (
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
  ) : (
    <Text
      fontSize={"xs"}
      color={"gray.500"}
      textAlign={"center"}
    >recent potlucks will show up here!</Text>
  );
};

// doing default export so next/dynamic will stop complaining
export default PreviousRoomsList;