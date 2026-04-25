// Server-only helper for the OG image route. Reads via Supabase REST
// (no SDK on Edge), querying the rooms_public view explicitly so the
// service-role key can't accidentally leak `location` into a public
// surface.

import type { IRoomObj } from "@/types";

type SupabaseRow = Record<string, unknown>;

async function sb(path: string): Promise<unknown> {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${path}`;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const res = await fetch(url, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function fetchOgRoom(roomId: string): Promise<IRoomObj | null> {
  try {
    const [rooms, members, foods] = (await Promise.all([
      sb(`rooms_public?id=eq.${encodeURIComponent(roomId)}&select=id,name,date,created_at`),
      sb(`room_members?room_id=eq.${encodeURIComponent(roomId)}&select=user_id,display_name,is_host,joined_at`),
      sb(`foods?room_id=eq.${encodeURIComponent(roomId)}&select=id,title,type,attributes,claimed_by,created_by`),
    ])) as [SupabaseRow[], SupabaseRow[], SupabaseRow[]];

    if (!rooms.length) return null;
    const r = rooms[0];

    const users = members.map((m) => ({
      id: String(m.user_id),
      name: String(m.display_name ?? ""),
    }));
    const hostIds = members
      .filter((m) => m.is_host)
      .map((m) => String(m.user_id));

    return {
      id: String(r.id),
      name: String(r.name ?? ""),
      ...(r.date ? { date: String(r.date) } : {}),
      users: users as IRoomObj["users"],
      foods: foods.map((f) => ({
        id: String(f.id),
        title: String(f.title ?? ""),
        ...(f.type ? { type: f.type as IRoomObj["foods"][0]["type"] } : {}),
        ...(Array.isArray(f.attributes) && f.attributes.length
          ? { attributes: f.attributes as IRoomObj["foods"][0]["attributes"] }
          : {}),
      })),
      hostIds,
    };
  } catch (err) {
    console.error("[og] fetchOgRoom failed", err);
    return null;
  }
}
