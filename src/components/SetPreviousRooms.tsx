import { IPrevRoom } from "@/utils/misc";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useEffect, useRef } from "react";

export interface ISetPrevRoomProps {
  roomId: string;
  roomName: string;
  ready: boolean;
  hostName?: string;
}

const useSetPrevRooms = ({ roomId, roomName, ready, hostName }: ISetPrevRoomProps) => {
  const [_, setPrevRooms] = useLocalStorage<IPrevRoom[]>("prevRooms", []);
  // useLocalStorage hands back a new setter every time the stored value
  // changes. Read it through a ref so writing `lastVisited` does not
  // re-trigger this effect in a loop.
  const setPrevRoomsRef = useRef(setPrevRooms);
  setPrevRoomsRef.current = setPrevRooms;
  useEffect(() => {
    if (ready) {
      setPrevRoomsRef.current((prevRooms) => {
        // see if the room is already in local storage...
        const room = prevRooms.find((room) => room.id === roomId);
        const updatedRoomName = roomName || roomId;
        const visitedAt = new Date().toISOString();
        if (!room) {
          return [
            ...prevRooms,
            {
              id: roomId,
              name: updatedRoomName,
              lastVisited: visitedAt,
              ...(hostName ? { hostName } : {}),
            },
          ];
        } else {
          return prevRooms.map((prevRoom) => {
            if (prevRoom.id === roomId) {
              return {
                ...prevRoom,
                name: updatedRoomName,
                lastVisited: visitedAt,
                // Refresh hostName when we have one; otherwise preserve the
                // existing value so brief load gaps don't wipe it.
                ...(hostName ? { hostName } : {}),
              };
            }
            return prevRoom;
          });
        }
      });
    }
  }, [roomId, roomName, ready, hostName]);
};

// this is jank b/c we can't use the localstorage hook in the server so we dynamically import this component
export const SetPrevRooms = ({ roomId, roomName, ready, hostName }: ISetPrevRoomProps) => {
  useSetPrevRooms({ roomId, roomName, ready, hostName });
};

export default SetPrevRooms;