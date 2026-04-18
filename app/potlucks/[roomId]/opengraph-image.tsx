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

export default async function Image({ params }: { params: { roomId: string } }) {
  const room = await fetchRoomRest(params.roomId).catch(() => null);

  const title = (room?.name?.trim() || "Potluck Menu").slice(0, 80);
  const date = room?.date?.trim();
  const location = room?.location?.trim();
  const foods = room?.foods || [];
  const users = room?.users || [];

  const titleFontSize = Math.max(44, Math.min(80, Math.floor(2000 / Math.max(title.length, 8))));

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
          fontFamily: "Georgia, serif",
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
              }}
            >
              POTLUCKY
            </div>
          </div>
          {(date || location) && (
            <div style={{ display: "flex", fontSize: 22, color: "#57534E" }}>
              {[date, location].filter(Boolean).join("  ·  ")}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 28 }}>
          <div
            style={{
              display: "flex",
              fontSize: titleFontSize,
              lineHeight: 1.05,
              color: "#292524",
              fontWeight: 700,
              letterSpacing: -1,
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
                          <div style={{ display: "flex", fontSize: 28, marginRight: 10 }}>
                            {g.emoji}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              fontSize: 24,
                              fontWeight: 600,
                              color: "#292524",
                              marginRight: 8,
                            }}
                          >
                            {g.label}
                          </div>
                          <div style={{ display: "flex", fontSize: 20, color: "#A8A29E" }}>
                            · {g.items.length}
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: 6 }}>
                          {preview.map((f, i) => (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                fontSize: 24,
                                color: "#292524",
                                marginTop: 2,
                              }}
                            >
                              · {f.title || "Untitled"}
                            </div>
                          ))}
                          {extra > 0 && (
                            <div
                              style={{
                                display: "flex",
                                fontSize: 20,
                                color: "#A8A29E",
                                marginTop: 4,
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
          }}
        >
          <div style={{ display: "flex" }}>
            <div style={{ display: "flex", marginRight: 24 }}>
              👥 {cookCount} {cookCount === 1 ? "cook" : "cooks"}
            </div>
            <div style={{ display: "flex" }}>
              🍽️ {totalDishes} {totalDishes === 1 ? "dish" : "dishes"}
            </div>
          </div>
          <div style={{ display: "flex", color: "#E8A817", fontWeight: 700 }}>tap to join →</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
