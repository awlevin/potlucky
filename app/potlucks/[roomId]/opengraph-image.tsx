import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Potlucky menu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: { roomId: string } }) {
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
        }}
      >
        <div style={{ display: "flex", fontSize: 120 }}>🍲</div>
        <div style={{ display: "flex", fontSize: 72, color: "#292524", marginTop: 24 }}>
          Potlucky
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#57534E", marginTop: 16 }}>
          room: {params.roomId}
        </div>
      </div>
    ),
    { ...size }
  );
}
