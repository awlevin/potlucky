import { ImageResponse } from "next/og";
import { fetchRoomRest } from "@/lib/firebase/rest";

export const runtime = "edge";
export const alt = "Potlucky menu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadGoogleFont(family: string, weight: number): Promise<ArrayBuffer | null> {
  try {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}:wght@${weight}`;
    const css = await fetch(cssUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    }).then((r) => r.text());
    const match = css.match(/src:\s*url\((.+?)\)\s*format\(['"](?:woff2|truetype|opentype)['"]\)/);
    if (!match) return null;
    return await fetch(match[1]).then((r) => r.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: { roomId: string } }) {
  const [room, fraunces] = await Promise.all([
    fetchRoomRest(params.roomId).catch(() => null),
    loadGoogleFont("Fraunces", 700),
  ]);

  const title = (room?.name?.trim() || "Potluck Menu").slice(0, 80);
  const dishes = room?.foods?.length ?? 0;
  const cooks = room?.users?.length ?? 0;

  const fonts = fraunces
    ? [{ name: "Fraunces", data: fraunces, weight: 700 as const, style: "normal" as const }]
    : undefined;

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
          fontFamily: fonts ? "Fraunces, Georgia, serif" : "Georgia, serif",
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
    { ...size, fonts }
  );
}
