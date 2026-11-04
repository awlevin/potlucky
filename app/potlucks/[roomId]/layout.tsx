import type { Metadata } from "next";
import { fetchRoomRest } from "@/lib/firebase/rest";
import { SITE_NAME } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: { roomId: string };
}): Promise<Metadata> {
  // Rooms are unlisted: the link is the invite. Keep them out of search
  // results even when a link gets posted somewhere public.
  const robots = { index: false, follow: false };

  const room = await fetchRoomRest(params.roomId);
  if (!room) return { robots };

  const title = (room.name?.trim() || "Potluck Menu").slice(0, 80);
  const dishes = room.foods?.length ?? 0;
  const cooks = room.users?.length ?? 0;

  const descParts = [
    dishes > 0 ? `${dishes} ${dishes === 1 ? "dish" : "dishes"}` : null,
    cooks > 0 ? `${cooks} ${cooks === 1 ? "cook" : "cooks"}` : null,
    // Never put `location` here: link previews are cached and re-shared
    // by chat apps and social sites, and a home address must not leak.
    room.date?.trim() || null,
  ].filter(Boolean);

  const description =
    descParts.length > 0
      ? descParts.join(" · ")
      : "Join the potluck on Potlucky.";

  return {
    title: `${title} · Potlucky`,
    description,
    robots,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function RoomLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
