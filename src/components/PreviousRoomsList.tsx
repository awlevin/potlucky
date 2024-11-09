import { useLocalStorage } from "@uidotdev/usehooks";
import { useRouter } from "next/navigation";
import { Button, Collapsible, List, Text } from '@chakra-ui/react'
import { IPrevRoom } from "@/utils/misc";
import { useEffect, useState } from "react";

export const PreviousRoomsList = () => {
  const [prevRooms] = useLocalStorage<IPrevRoom[]>("prevRooms", []);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    }
  }, []);

  return prevRooms.length > 0 ? (
    <Collapsible.Root open={mounted}>
      <List.Root>
        {prevRooms.reverse().map((room) => (
          <List.Item key={room.id}>
            <Button
              onClick={() => router.push(`/potlucks/${room.id}`)}
              size={"xs"}
            >
              {room.name}
            </Button>
          </List.Item>
        ))}
      </List.Root>
    </Collapsible.Root>
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