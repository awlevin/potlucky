import { ImageResponse } from "next/og";
import { fetchRoomRest } from "@/lib/firebase/rest";

export const runtime = "edge";
export const alt = "Potlucky menu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CATEGORIES: { key: string; label: string; emoji: string }[] = [
  { key: "appetizer", label: "Appetizers", emoji: "🥗" },
  { key: "main", label: "Mains", emoji: "🍖" },
  { key: "side", label: "Sides", emoji: "🥘" },
  { key: "dessert", label: "Desserts", emoji: "🍰" },
  { key: "drink", label: "Drinks", emoji: "🥤" },
];

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

function FallbackCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FFFCF5",
        fontFamily: "Georgia, serif",
      }}
    >
      <div style={{ display: "flex", fontSize: 100 }}>🍲</div>
      <div
        style={{
          display: "flex",
          marginTop: 20,
          fontSize: 64,
          color: "#292524",
          fontWeight: 700,
        }}
      >
        Potlucky
      </div>
      <div style={{ display: "flex", marginTop: 12, fontSize: 28, color: "#57534E" }}>
        Tap to join the potluck
      </div>
    </div>
  );
}

export default async function Image({ params }: { params: { roomId: string } }) {
  try {
    return await renderCard(params.roomId);
  } catch {
    return new ImageResponse(<FallbackCard />, { ...size });
  }
}

async function renderCard(roomId: string) {
  const [room, frauncesSemi, frauncesBold] = await Promise.all([
    fetchRoomRest(roomId),
    loadGoogleFont("Fraunces", 600),
    loadGoogleFont("Fraunces", 700),
  ]);

  const title = (room?.name?.trim() || "Potluck Menu").slice(0, 80);
  const date = room?.date?.trim();
  const location = room?.location?.trim();
  const foods = room?.foods || [];
  const users = room?.users || [];

  // Scale title to width budget (~1088px after padding) assuming Fraunces bold
  // avg char width ≈ 0.52 × fontSize. Clamp to a readable range.
  const titleFontSize = Math.max(44, Math.min(88, Math.floor(2100 / Math.max(title.length, 8))));

  const grouped = CATEGORIES.map((c) => ({
    ...c,
    items: foods
      .filter((f) => f.type === c.key)
      .sort((a, b) => (a.title || "").localeCompare(b.title || "")),
  })).filter((c) => c.items.length > 0);

  const uncategorized = foods.filter(
    (f) => !f.type || !CATEGORIES.some((c) => c.key === f.type)
  );
  if (uncategorized.length > 0) {
    grouped.push({ key: "other", label: "Other", emoji: "📋", items: uncategorized });
  }

  const left = grouped.filter((_, i) => i % 2 === 0);
  const right = grouped.filter((_, i) => i % 2 === 1);
  const totalDishes = foods.length;
  const cookCount = users.length;

  const fonts: { name: string; data: ArrayBuffer; weight: 600 | 700; style: "normal" }[] = [];
  if (frauncesSemi) fonts.push({ name: "Fraunces", data: frauncesSemi, weight: 600, style: "normal" });
  if (frauncesBold) fonts.push({ name: "Fraunces", data: frauncesBold, weight: 700, style: "normal" });

  const serifStack = fonts.length ? "Fraunces, Georgia, serif" : "Georgia, serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#FFFCF5",
          padding: 56,
          fontFamily: serifStack,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ display: "flex", fontSize: 34, marginRight: 12 }}>🍲</div>
            <div
              style={{
                display: "flex",
                fontSize: 22,
                letterSpacing: 3,
                color: "#E8A817",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              Potlucky
            </div>
          </div>
          {(date || location) && (
            <div style={{ display: "flex", fontSize: 22, color: "#57534E" }}>
              {[date, location].filter(Boolean).join("  ·  ")}
            </div>
          )}
        </div>

        <div style={{ marginTop: 28, display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: titleFontSize,
              lineHeight: 1.05,
              color: "#292524",
              fontWeight: 700,
              letterSpacing: -1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              maxWidth: 1088,
            }}
          >
            {title}
          </div>
          <div
            style={{ marginTop: 14, height: 5, width: 104, background: "#E8A817", borderRadius: 3 }}
          />
        </div>

        <div style={{ display: "flex", flex: 1, marginTop: 36 }}>
          {grouped.length === 0 ? (
            <div
              style={{
                display: "flex",
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
                color: "#A8A29E",
                fontFamily: "sans-serif",
              }}
            >
              Menu in progress — come add a dish!
            </div>
          ) : (
            <div style={{ display: "flex", flex: 1 }}>
              {[left, right].map((col, ci) => (
                <div
                  key={ci}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    marginRight: ci === 0 ? 48 : 0,
                  }}
                >
                  {col.map((g) => {
                    const preview = g.items.slice(0, 3);
                    const extra = g.items.length - preview.length;
                    return (
                      <div
                        key={g.key}
                        style={{ display: "flex", flexDirection: "column", marginBottom: 26 }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <span style={{ fontSize: 28, marginRight: 10 }}>{g.emoji}</span>
                          <span
                            style={{
                              fontSize: 24,
                              fontWeight: 600,
                              color: "#292524",
                              marginRight: 8,
                            }}
                          >
                            {g.label}
                          </span>
                          <span style={{ fontSize: 20, color: "#A8A29E" }}>· {g.items.length}</span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            marginTop: 6,
                            fontFamily: "sans-serif",
                          }}
                        >
                          {preview.map((f, i) => (
                            <div
                              key={i}
                              style={{ fontSize: 24, color: "#292524", marginTop: 2, display: "flex" }}
                            >
                              ·  {f.title || "Untitled"}
                            </div>
                          ))}
                          {extra > 0 && (
                            <div
                              style={{
                                fontSize: 20,
                                color: "#A8A29E",
                                marginTop: 4,
                                display: "flex",
                              }}
                            >
                              + {extra} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 20,
            paddingTop: 20,
            borderTop: "1px solid #E7E5E4",
            fontSize: 24,
            color: "#57534E",
            fontFamily: "sans-serif",
          }}
        >
          <div style={{ display: "flex" }}>
            <span style={{ marginRight: 24 }}>
              👥 {cookCount} {cookCount === 1 ? "cook" : "cooks"}
            </span>
            <span>
              🍽️ {totalDishes} {totalDishes === 1 ? "dish" : "dishes"}
            </span>
          </div>
          <div style={{ color: "#E8A817", fontWeight: 700, display: "flex" }}>tap to join →</div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
