import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { DietaryRestriction } from "@/types";
import {
  NotAMemberError,
  NotAuthenticatedError,
  type RoomRepository,
} from "./repository";
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
  FoodType,
} from "./types";

type DB = Database;

type FoodRow = DB["public"]["Tables"]["foods"]["Row"];
type MemberRow = DB["public"]["Tables"]["room_members"]["Row"];
type RoomRow = DB["public"]["Tables"]["rooms"]["Row"];
type PublicRoomRow = DB["public"]["Views"]["rooms_public"]["Row"];

function mapFood(row: FoodRow): RoomFood {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    type: (row.type as FoodType | null) ?? null,
    attributes: Array.isArray(row.attributes)
      ? (row.attributes as DietaryRestriction[])
      : [],
    claimedBy: row.claimed_by,
    createdBy: row.created_by,
  };
}

function mapMember(row: MemberRow): RoomMember {
  return {
    userId: row.user_id,
    displayName: row.display_name,
    color: row.color,
    isHost: row.is_host,
    dietaryRestrictions: Array.isArray(row.dietary_restrictions)
      ? (row.dietary_restrictions as DietaryRestriction[])
      : [],
    dietaryNote: row.dietary_note,
    joinedAt: row.joined_at,
    lastActive: row.last_active,
  };
}

function mapPublicRoom(
  row: PublicRoomRow,
  members: MemberRow[],
  foods: FoodRow[]
): PublicRoom {
  return {
    id: row.id!,
    name: row.name ?? "",
    date: row.date ?? null,
    createdBy: row.created_by ?? "",
    createdAt: row.created_at ?? "",
    closedAt: row.closed_at ?? null,
    members: members.map(mapMember),
    foods: foods.map(mapFood),
  };
}

function mapRoom(
  row: RoomRow,
  members: MemberRow[],
  foods: FoodRow[]
): Room {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    location: row.location,
    createdBy: row.created_by,
    createdAt: row.created_at,
    closedAt: row.closed_at,
    members: members.map(mapMember),
    foods: foods.map(mapFood),
  };
}

export class SupabaseRoomRepository implements RoomRepository {
  constructor(private readonly supabase: SupabaseClient<DB>) {}

  private async currentUserId(): Promise<string> {
    const { data } = await this.supabase.auth.getUser();
    if (!data.user) throw new NotAuthenticatedError();
    return data.user.id;
  }

  async getRoom(id: string): Promise<PublicRoom | null> {
    const [roomRes, membersRes, foodsRes] = await Promise.all([
      this.supabase.from("rooms_public").select("*").eq("id", id).maybeSingle(),
      this.supabase.from("room_members").select("*").eq("room_id", id),
      this.supabase.from("foods").select("*").eq("room_id", id),
    ]);

    if (roomRes.error) throw roomRes.error;
    if (!roomRes.data) return null;

    if (membersRes.error) throw membersRes.error;
    if (foodsRes.error) throw foodsRes.error;

    return mapPublicRoom(roomRes.data, membersRes.data ?? [], foodsRes.data ?? []);
  }

  async getRoomWithLocation(id: string): Promise<Room | null> {
    const [roomRes, membersRes, foodsRes] = await Promise.all([
      this.supabase.from("rooms").select("*").eq("id", id).maybeSingle(),
      this.supabase.from("room_members").select("*").eq("room_id", id),
      this.supabase.from("foods").select("*").eq("room_id", id),
    ]);

    if (roomRes.error) throw roomRes.error;
    // With RLS enabled, a non-member gets zero rows from `rooms` even if
    // the room exists. To distinguish "room doesn't exist" from "not a
    // member," fall back to the public view.
    if (!roomRes.data) {
      const publicCheck = await this.supabase
        .from("rooms_public")
        .select("id")
        .eq("id", id)
        .maybeSingle();
      if (publicCheck.data) throw new NotAMemberError(id);
      return null;
    }

    if (membersRes.error) throw membersRes.error;
    if (foodsRes.error) throw foodsRes.error;

    return mapRoom(roomRes.data, membersRes.data ?? [], foodsRes.data ?? []);
  }

  subscribeToRoom(
    id: string,
    onChange: (room: PublicRoom) => void
  ): Unsubscribe {
    const refetch = async () => {
      try {
        const room = await this.getRoom(id);
        if (room) onChange(room);
      } catch (err) {
        console.error("[supabase] refetch on realtime change failed", err);
      }
    };

    const channel = this.supabase
      .channel(`room:${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms", filter: `id=eq.${id}` },
        refetch
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_members",
          filter: `room_id=eq.${id}`,
        },
        refetch
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "foods",
          filter: `room_id=eq.${id}`,
        },
        refetch
      )
      .subscribe();

    return () => {
      this.supabase.removeChannel(channel);
    };
  }

  async createRoom(input: CreateRoomInput): Promise<PublicRoom> {
    const userId = await this.currentUserId();
    const { error } = await this.supabase
      .from("rooms")
      .insert({ id: input.id, name: input.name, created_by: userId });
    if (error) throw error;

    const room = await this.getRoom(input.id);
    if (!room) throw new Error("Room insert succeeded but fetch returned null");
    return room;
  }

  async updateRoomMetadata(id: string, patch: RoomMetadataPatch): Promise<void> {
    const payload: Partial<RoomRow> = {};
    if (patch.name !== undefined) payload.name = patch.name;
    if (patch.date !== undefined) payload.date = patch.date;
    if (patch.location !== undefined) payload.location = patch.location;
    if (Object.keys(payload).length === 0) return;

    const { error } = await this.supabase.from("rooms").update(payload).eq("id", id);
    if (error) throw error;
  }

  async joinRoom(roomId: string, input: JoinRoomInput): Promise<RoomMember> {
    const userId = await this.currentUserId();

    const { count, error: countErr } = await this.supabase
      .from("room_members")
      .select("*", { count: "exact", head: true })
      .eq("room_id", roomId)
      .eq("is_host", true);
    if (countErr) throw countErr;
    const isHost = (count ?? 0) === 0;

    const { data, error } = await this.supabase
      .from("room_members")
      .upsert(
        {
          room_id: roomId,
          user_id: userId,
          display_name: input.displayName,
          color: input.color,
          is_host: isHost,
        },
        { onConflict: "room_id,user_id", ignoreDuplicates: false }
      )
      .select()
      .single();
    if (error) throw error;
    return mapMember(data);
  }

  async updateMember(roomId: string, patch: UpdateMemberInput): Promise<void> {
    const userId = await this.currentUserId();
    const payload: Partial<MemberRow> = { last_active: new Date().toISOString() };
    if (patch.displayName !== undefined) payload.display_name = patch.displayName;
    if (patch.color !== undefined) payload.color = patch.color;
    if (patch.dietaryRestrictions !== undefined)
      payload.dietary_restrictions = patch.dietaryRestrictions as unknown as MemberRow["dietary_restrictions"];
    if (patch.dietaryNote !== undefined) payload.dietary_note = patch.dietaryNote;

    const { error } = await this.supabase
      .from("room_members")
      .update(payload)
      .eq("room_id", roomId)
      .eq("user_id", userId);
    if (error) throw error;
  }

  async leaveRoom(roomId: string): Promise<void> {
    const userId = await this.currentUserId();
    const { error } = await this.supabase
      .from("room_members")
      .delete()
      .eq("room_id", roomId)
      .eq("user_id", userId);
    if (error) throw error;
  }

  async addFood(roomId: string, input: AddFoodInput): Promise<RoomFood> {
    const userId = await this.currentUserId();
    const { data, error } = await this.supabase
      .from("foods")
      .insert({
        room_id: roomId,
        title: input.title,
        notes: input.notes ?? null,
        type: input.type ?? null,
        attributes: (input.attributes ?? []) as unknown as FoodRow["attributes"],
        created_by: userId,
      })
      .select()
      .single();
    if (error) throw error;
    return mapFood(data);
  }

  async updateFood(
    roomId: string,
    foodId: string,
    patch: Partial<AddFoodInput>
  ): Promise<void> {
    const payload: Partial<FoodRow> = {};
    if (patch.title !== undefined) payload.title = patch.title;
    if (patch.notes !== undefined) payload.notes = patch.notes;
    if (patch.type !== undefined) payload.type = patch.type ?? null;
    if (patch.attributes !== undefined)
      payload.attributes = patch.attributes as unknown as FoodRow["attributes"];
    if (Object.keys(payload).length === 0) return;

    const { error } = await this.supabase
      .from("foods")
      .update(payload)
      .eq("id", foodId)
      .eq("room_id", roomId);
    if (error) throw error;
  }

  async removeFood(roomId: string, foodId: string): Promise<void> {
    const { error } = await this.supabase
      .from("foods")
      .delete()
      .eq("id", foodId)
      .eq("room_id", roomId);
    if (error) throw error;
  }

  async claimFood(roomId: string, foodId: string): Promise<void> {
    const userId = await this.currentUserId();
    const { error } = await this.supabase
      .from("foods")
      .update({ claimed_by: userId })
      .eq("id", foodId)
      .eq("room_id", roomId);
    if (error) throw error;
  }

  async unclaimFood(roomId: string, foodId: string): Promise<void> {
    const userId = await this.currentUserId();
    const { error } = await this.supabase
      .from("foods")
      .update({ claimed_by: null })
      .eq("id", foodId)
      .eq("room_id", roomId)
      .eq("claimed_by", userId);
    if (error) throw error;
  }
}
