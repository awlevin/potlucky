type FirestoreVal = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  nullValue?: null;
  arrayValue?: { values?: FirestoreVal[] };
  mapValue?: { fields?: Record<string, FirestoreVal> };
};

function unwrap(v: FirestoreVal): unknown {
  if (v == null) return v;
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("nullValue" in v) return null;
  if ("arrayValue" in v) return (v.arrayValue?.values || []).map(unwrap);
  if ("mapValue" in v) {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v.mapValue?.fields || {})) out[k] = unwrap(val);
    return out;
  }
  return null;
}

export type RestRoom = {
  name?: string;
  date?: string;
  location?: string;
  foods?: { title?: string; type?: string }[];
  users?: { name?: string }[];
};

export async function fetchRoomRest(roomId: string): Promise<RestRoom | null> {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) return null;
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/rooms/${encodeURIComponent(roomId)}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.fields) return null;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data.fields)) out[k] = unwrap(v as FirestoreVal);
    return out as RestRoom;
  } catch {
    return null;
  }
}
