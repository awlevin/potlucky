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
        if (prevRooms.some((room) => room.id === roomId)) {
          return prevRooms;
        }
        return [...prevRooms, { id: roomId, name: roomName || roomId }];
      });
    }
  }, [roomId, roomName, ready]);
};

// this is jank b/c we can't use the localstorage hook in the server so we dynamically import this component
export const SetPrevRooms = ({ roomId, roomName, ready }: ISetPrevRoomProps) => {
  useSetPrevRooms({ roomId, roomName, ready });
};

export default SetPrevRooms;