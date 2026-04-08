import { IPrevRoom } from "@/utils/misc";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useEffect } from "react";

export interface ISetPrevRoomProps {
  roomId: string;
  roomName: string;
  ready: boolean;
}

const useSetPrevRooms = ({ roomId, roomName, ready }: ISetPrevRoomProps) => {
  const [_, setPrevRooms] = useLocalStorage<IPrevRoom[]>("prevRooms", []);
  useEffect(() => {
    if (ready) {
      setPrevRooms((prevRooms) => {
        // see if the room is already in local storage...
        const room = prevRooms.find((room) => room.id === roomId);
        const updatedRoomName = roomName || roomId;
        if (!room) {
          // if not, add it
          return [...prevRooms, { id: roomId, name: updatedRoomName, lastVisited: new Date().toISOString() }];
        } else {
          // if it is, update it to make sure it has the right room name
          return prevRooms.map((prevRoom) => {
            if (prevRoom.id === roomId) {
              return { ...prevRoom, name: updatedRoomName, lastVisited: new Date().toISOString() };
            }
            return prevRoom;
          });
        }
      });
    }
  }, [roomId, roomName, ready]);
};

// this is jank b/c we can't use the localstorage hook in the server so we dynamically import this component
export const SetPrevRooms = ({ roomId, roomName, ready }: ISetPrevRoomProps) => {
  useSetPrevRooms({ roomId, roomName, ready });
};

export default SetPrevRooms;