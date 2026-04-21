import type { User } from "@/types";

export function getHostUsers(
  users: User[] | undefined,
  hostIds: string[] | undefined
): User[] {
  if (!users?.length || !hostIds?.length) return [];
  const byId = new Map(users.map((u) => [u.id, u]));
  return hostIds.map((id) => byId.get(id)).filter((u): u is User => Boolean(u));
}

function joinNames(names: string[]): string {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} & ${names[names.length - 1]}`;
}

/**
 * "Aaron is hosting" / "You're hosting" / "Aaron & Sam are hosting" /
 * "Aaron & 2 others are hosting" (4+ hosts) / "You & Sam are hosting".
 */
export function formatHostsSentence(hosts: User[], viewerId?: string): string {
  if (hosts.length === 0) return "";

  const viewerIsHost = Boolean(
    viewerId && hosts.some((h) => h.id === viewerId)
  );

  if (hosts.length === 1) {
    return viewerIsHost ? "You're hosting" : `${hosts[0].name} is hosting`;
  }

  if (viewerIsHost) {
    const others = hosts.filter((h) => h.id !== viewerId);
    if (hosts.length >= 4) {
      const first = others[0]?.name ?? "";
      const extra = hosts.length - 2; // minus viewer, minus first other
      return `You, ${first} & ${extra} ${
        extra === 1 ? "other" : "others"
      } are hosting`;
    }
    const names = ["You", ...others.map((o) => o.name)];
    return `${joinNames(names)} are hosting`;
  }

  if (hosts.length >= 4) {
    const extra = hosts.length - 1;
    return `${hosts[0].name} & ${extra} ${
      extra === 1 ? "other" : "others"
    } are hosting`;
  }

  return `${joinNames(hosts.map((h) => h.name))} are hosting`;
}

/**
 * "Aaron" / "Aaron & Sam" / "Aaron, Sam & Priya" / "Aaron + 2" (4+ hosts).
 */
export function formatHostsByline(hosts: User[]): string {
  if (hosts.length === 0) return "";
  if (hosts.length >= 4) {
    return `${hosts[0].name} + ${hosts.length - 1}`;
  }
  return joinNames(hosts.map((h) => h.name));
}

function possessive(name: string): string {
  if (!name) return "";
  return name.endsWith("s") || name.endsWith("S") ? `${name}'` : `${name}'s`;
}

/**
 * "Aaron's" / "Aaron & Sam's" / "Chris'" — English possessive.
 * For multiple hosts, only the last name gets the suffix.
 */
export function formatHostsPossessive(hosts: User[]): string {
  if (hosts.length === 0) return "";
  if (hosts.length === 1) return possessive(hosts[0].name);
  if (hosts.length >= 4) {
    const extra = hosts.length - 1;
    return `${hosts[0].name} + ${extra}'s`;
  }
  const names = hosts.map((h) => h.name);
  const last = possessive(names[names.length - 1]);
  const leading = names.slice(0, -1);
  return `${leading.join(", ")} & ${last}`;
}
