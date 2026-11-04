import { ImageResponse } from "next/og";
import { loadOgFonts } from "@/lib/ogFonts";

export const runtime = "edge";
export const alt = "Potlucky — the friendliest way to plan a potluck";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const { fonts, serif, sans } = await loadOgFonts(["frauncesBold", "dmSansRegular"]);

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
    { ...size, fonts }
  );
}
