import { ImageResponse } from "next/og";
import { getPresetBySlug, getMarketablePresets } from "@/data/presets";
import { loadOgFonts } from "@/lib/ogFonts";

export const alt = "Potlucky potluck planner";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return getMarketablePresets().map((p) => ({ slug: p.marketing!.slug }));
}

export default async function OgImage({
  params,
}: {
  params: { slug: string };
}) {
  const preset = getPresetBySlug(params.slug);
  const name = preset?.name ?? "Potlucky";
  const emoji = preset?.emoji ?? "🍽️";
  const dishCount = preset?.dishes.length ?? 0;
  const tagline = preset?.marketing?.headline ?? "Potluck planner, made simple";
  const { fonts, serif, sans } = await loadOgFonts(["frauncesBold", "dmSansRegular", "dmSansSemibold"]);

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
          padding: "64px",
          background:
            "linear-gradient(160deg, #FFFCF5 0%, #FFF0C7 35%, #FEF1ED 65%, #FFFCF5 100%)",
          fontFamily: sans,
        }}
      >
        <div style={{ display: "flex", fontSize: 180, lineHeight: 1, marginBottom: 28 }}>
          {emoji}
        </div>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            fontFamily: serif,
            color: "#292524",
            letterSpacing: -1.5,
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: 16,
            display: "flex",
          }}
        >
          {tagline}
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#57534E",
            textAlign: "center",
            marginBottom: 36,
            display: "flex",
          }}
        >
          {dishCount > 0
            ? `${dishCount} curated dishes · `
            : ""}
          Share a link. Claim dishes. Feast.
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 28px",
            background: "#E8A817",
            color: "#292524",
            borderRadius: 16,
            fontSize: 28,
            fontWeight: 600,
          }}
        >
          {`🍲 ${name}`}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
