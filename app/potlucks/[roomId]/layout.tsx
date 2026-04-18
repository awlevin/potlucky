import type { Metadata } from "next";
import { fetchRoomRest } from "@/lib/firebase/rest";

export async function generateMetadata({
  params,
}: {
  params: { roomId: string };
}): Promise<Metadata> {
  const room = await fetchRoomRest(params.roomId);
  if (!room) return {};

  const title = (room.name?.trim() || "Potluck Menu").slice(0, 80);
  const dishes = room.foods?.length ?? 0;
  const cooks = room.users?.length ?? 0;

  const descParts = [
    dishes > 0 ? `${dishes} ${dishes === 1 ? "dish" : "dishes"}` : null,
    cooks > 0 ? `${cooks} ${cooks === 1 ? "cook" : "cooks"}` : null,
    room.date?.trim() || null,
    room.location?.trim() || null,
  ].filter(Boolean);

  const description =
    descParts.length > 0
      ? descParts.join(" · ")
      : "Join the potluck on Potlucky.";

  return {
    title: `${title} · Potlucky`,
    description,
    openGraph: {
      title,
      description,
      type: "website",
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
