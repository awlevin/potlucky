import { ImageResponse } from "next/og";
import { fetchRoomRest } from "@/lib/firebase/rest";

export const runtime = "edge";
export const alt = "Potlucky menu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { roomId: string } }) {
  const room = await fetchRoomRest(params.roomId).catch(() => null);
  const title = (room?.name?.trim() || "Potluck Menu").slice(0, 80);
  const dishes = room?.foods?.length ?? 0;
  const cooks = room?.users?.length ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFCF5",
          fontFamily: "Fraunces, Georgia, serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 100 }}>🍲</div>
        <div style={{ display: "flex", fontSize: 64, color: "#292524", marginTop: 24 }}>
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#57534E", marginTop: 16 }}>
          {dishes} dishes · {cooks} cooks
        </div>
      </div>
    ),
    { ...size }
  );
}
