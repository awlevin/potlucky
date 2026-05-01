import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { DietaryRestriction } from "@/types";
import {
  NotAMemberError,
  NotAuthenticatedError,
  type RoomRepository,
  type SubscribeRoomOptions,
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

  subscribeToRoom(id: string, opts: SubscribeRoomOptions): Unsubscribe {
    // Apply each postgres event's payload to local state directly. No
    // refetch — payload.new contains the full row (and with replica
    // identity full, payload.old does too on UPDATE/DELETE).
    let firstSubscribe = true;

    const channel = this.supabase
      .channel(`room:${id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms", filter: `id=eq.${id}` },
        (payload) => {
          opts.onUpdate((prev) => {
            if (!prev) return prev;
            if (payload.eventType === "DELETE") return null;
            const r = payload.new as RoomRow;
            return {
              ...prev,
              name: r.name,
              date: r.date,
              closedAt: r.closed_at,
            };
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_members",
          filter: `room_id=eq.${id}`,
        },
        (payload) => {
          opts.onUpdate((prev) => {
            if (!prev) return prev;
            if (payload.eventType === "INSERT") {
              const m = mapMember(payload.new as MemberRow);
              if (prev.members.some((x) => x.userId === m.userId)) return prev;
              return { ...prev, members: [...prev.members, m] };
            }
            if (payload.eventType === "UPDATE") {
              const m = mapMember(payload.new as MemberRow);
              return {
                ...prev,
                members: prev.members.map((x) => (x.userId === m.userId ? m : x)),
              };
            }
            if (payload.eventType === "DELETE") {
              const old = payload.old as MemberRow;
              return {
                ...prev,
                members: prev.members.filter((x) => x.userId !== old.user_id),
              };
            }
            return prev;
          });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "foods",
          filter: `room_id=eq.${id}`,
        },
        (payload) => {
          opts.onUpdate((prev) => {
            if (!prev) return prev;
            if (payload.eventType === "INSERT") {
              const f = mapFood(payload.new as FoodRow);
              if (prev.foods.some((x) => x.id === f.id)) return prev;
              return { ...prev, foods: [...prev.foods, f] };
            }
            if (payload.eventType === "UPDATE") {
              const f = mapFood(payload.new as FoodRow);
              return {
                ...prev,
                foods: prev.foods.map((x) => (x.id === f.id ? f : x)),
              };
            }
            if (payload.eventType === "DELETE") {
              const old = payload.old as FoodRow;
              return {
                ...prev,
                foods: prev.foods.filter((x) => x.id !== old.id),
              };
            }
            return prev;
          });
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          if (firstSubscribe) {
            firstSubscribe = false;
          } else {
            // Reconnected after a drop — there may be missed events.
            // Catch up via refetch.
            opts.onReconnect?.();
          }
        }
      });

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

    // Idempotency: if this user is already a member (e.g. user clicked
    // Join twice), update display_name/color but DO NOT touch is_host.
    // The original upsert logic re-evaluated `count(hosts) == 0` on every
    // call, which demoted the user the second time around.
    const { data: existing, error: existingErr } = await this.supabase
      .from("room_members")
      .select("*")
      .eq("room_id", roomId)
      .eq("user_id", userId)
      .maybeSingle();
    if (existingErr) throw existingErr;

    if (existing) {
      const { data, error } = await this.supabase
        .from("room_members")
        .update({
          display_name: input.displayName,
          color: input.color,
          last_active: new Date().toISOString(),
        })
        .eq("room_id", roomId)
        .eq("user_id", userId)
        .select()
        .single();
      if (error) throw error;
      return mapMember(data);
    }

    // First-joiner-becomes-host: only set when nobody else holds it.
    const { count, error: countErr } = await this.supabase
      .from("room_members")
      .select("*", { count: "exact", head: true })
      .eq("room_id", roomId)
      .eq("is_host", true);
    if (countErr) throw countErr;
    const isHost = (count ?? 0) === 0;

    const { data, error } = await this.supabase
      .from("room_members")
      .insert({
        room_id: roomId,
        user_id: userId,
        display_name: input.displayName,
        color: input.color,
        is_host: isHost,
      })
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
