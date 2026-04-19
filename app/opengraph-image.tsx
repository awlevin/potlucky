import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Potlucky — the friendliest way to plan a potluck";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function loadFontTTF(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

const FRAUNCES_700 =
  "https://cdn.jsdelivr.net/npm/@fontsource/fraunces@5.0.16/files/fraunces-latin-700-normal.woff";
const DM_SANS_400 =
  "https://cdn.jsdelivr.net/npm/@fontsource/dm-sans@5.0.9/files/dm-sans-latin-400-normal.woff";

export default async function Image() {
  const [fraunces, dmSans] = await Promise.all([
    loadFontTTF(FRAUNCES_700),
    loadFontTTF(DM_SANS_400),
  ]);

  const serif = fraunces ? "Fraunces, Georgia, serif" : "Georgia, serif";
  const sans = dmSans ? '"DM Sans", system-ui, sans-serif' : "system-ui, sans-serif";

  const fonts: { name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" }[] = [];
  if (fraunces) fonts.push({ name: "Fraunces", data: fraunces, weight: 700, style: "normal" });
  if (dmSans) fonts.push({ name: "DM Sans", data: dmSans, weight: 400, style: "normal" });

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
          fontFamily: sans,
          padding: 56,
        }}
      >
        <div style={{ display: "flex", fontSize: 180 }}>🍲</div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 128,
            color: "#292524",
            fontWeight: 700,
            fontFamily: serif,
            letterSpacing: -2,
          }}
        >
          Potlucky
        </div>
        <div
          style={{
            marginTop: 18,
            height: 5,
            width: 120,
            background: "#E8A817",
            borderRadius: 3,
          }}
        />
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 36,
            color: "#57534E",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          The friendliest way to plan a potluck
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 24,
            color: "#A8A29E",
          }}
        >
          Add friends · claim dishes · feast together
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined }
  );
}
