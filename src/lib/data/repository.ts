import type {
  AddFoodInput,
  CreateRoomInput,
  JoinRoomInput,
  PublicRoom,
  Room,
  RoomFood,
  RoomMember,
  RoomMetadataPatch,
  Unsubscribe,
  UpdateMemberInput,
} from "./types";

export type RoomUpdater = (
  prev: PublicRoom | null
) => PublicRoom | null;

export type SubscribeRoomOptions = {
  // Called for each postgres_changes event, with a state updater that
  // applies the change locally — no refetch needed. The payload contains
  // the full row data (replica identity full is set, so DELETE old rows
  // are populated too).
  onUpdate: (updater: RoomUpdater) => void;
  // Fired when the channel reconnects after a disconnect; consumers
  // typically call refetch() to catch up on any events that fired while
  // the websocket was down.
  onReconnect?: () => void;
};

export interface RoomRepository {
  getRoom(id: string): Promise<PublicRoom | null>;
  getRoomWithLocation(id: string): Promise<Room | null>;
  subscribeToRoom(id: string, opts: SubscribeRoomOptions): Unsubscribe;

  createRoom(input: CreateRoomInput): Promise<PublicRoom>;
  updateRoomMetadata(id: string, patch: RoomMetadataPatch): Promise<void>;

  joinRoom(roomId: string, input: JoinRoomInput): Promise<RoomMember>;
  updateMember(roomId: string, patch: UpdateMemberInput): Promise<void>;
  leaveRoom(roomId: string): Promise<void>;

  addFood(roomId: string, input: AddFoodInput): Promise<RoomFood>;
  updateFood(
    roomId: string,
    foodId: string,
    patch: Partial<AddFoodInput>
  ): Promise<void>;
  removeFood(roomId: string, foodId: string): Promise<void>;
  claimFood(roomId: string, foodId: string): Promise<void>;
  unclaimFood(roomId: string, foodId: string): Promise<void>;
}

export class NotAMemberError extends Error {
  constructor(roomId: string) {
    super(`Not a member of room ${roomId}`);
    this.name = "NotAMemberError";
  }
}

export class NotAuthenticatedError extends Error {
  constructor() {
    super("Sign-in required");
    this.name = "NotAuthenticatedError";
  }
}
