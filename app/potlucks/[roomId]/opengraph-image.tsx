import { ImageResponse } from "next/og";
import { fetchRoomRest } from "@/lib/firebase/rest";
import { loadOgFonts } from "@/lib/ogFonts";

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
  const [room, { fonts, serif: serifStack, sans: sansStack }] = await Promise.all([
    fetchRoomRest(params.roomId).catch(() => null),
    loadOgFonts(["frauncesBold", "frauncesItalic", "dmSansRegular", "dmSansSemibold"]),
  ]);

  const title = (room?.name?.trim() || "Potluck Menu").slice(0, 80);
  const date = room?.date?.trim();
  const foods = room?.foods || [];
  const users = room?.users || [];
  const hostIds = room?.hostIds || [];

  // Resolve host names, then build a byline like "by Aaron" / "by Aaron & Sam" /
  // "by Aaron, Sam & Priya" / "by Aaron + 2" (4+ hosts). Guard: if the title
  // already contains a host's first name (case-insensitive), skip the byline
  // so we don't stamp "by Aaron" under "Aaron's Birthday."
  const hostNames = hostIds
    .map((id) => users.find((u) => u?.id === id)?.name)
    .filter((n): n is string => Boolean(n && n.trim()));
  const titleLower = title.toLowerCase();
  const titleAlreadyNamesHost = hostNames.some((n) => {
    const first = n.trim().split(/\s+/)[0]?.toLowerCase();
    return first && titleLower.includes(first);
  });
  let hostByline = "";
  if (hostNames.length && !titleAlreadyNamesHost) {
    if (hostNames.length >= 4) {
      hostByline = `by ${hostNames[0]} + ${hostNames.length - 1}`;
    } else if (hostNames.length === 1) {
      hostByline = `by ${hostNames[0]}`;
    } else if (hostNames.length === 2) {
      hostByline = `by ${hostNames[0]} & ${hostNames[1]}`;
    } else {
      hostByline = `by ${hostNames.slice(0, -1).join(", ")} & ${hostNames[hostNames.length - 1]}`;
    }
  }

  const titleFontSize = Math.max(40, Math.min(60, Math.floor(1500 / Math.max(title.length, 8))));

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

  // Lay categories out in two columns, or three once there are more than
  // four, so the card never needs more than two rows. The menu area holds
  // two rows of "header + two dishes" only when there is no host byline;
  // with one, show a single dish per category so nothing is clipped. The
  // header count ("Sides · 4") covers dishes not shown.
  const columnCount = grouped.length > 4 ? 3 : 2;
  const columns = Array.from({ length: columnCount }, (_, ci) =>
    grouped.filter((_, i) => i % columnCount === ci)
  );
  const rowCount = Math.max(...columns.map((c) => c.length), 0);
  const previewCount = rowCount >= 2 && hostByline ? 1 : 2;
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
          padding: "44px 56px",
          fontFamily: sansStack,
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
                fontFamily: serifStack,
              }}
            >
              POTLUCKY
            </div>
          </div>
          {date && (
            <div style={{ display: "flex", fontSize: 22, color: "#57534E" }}>
              {date}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: titleFontSize,
              lineHeight: 1.05,
              color: "#292524",
              fontWeight: 700,
              letterSpacing: -1,
              maxWidth: 1088,
              fontFamily: serifStack,
            }}
          >
            {title}
          </div>
          {hostByline && (
            <div
              style={{
                display: "flex",
                marginTop: 10,
                fontSize: 28,
                color: "#8A5F0A",
                fontFamily: serifStack,
                fontStyle: "italic",
                fontWeight: 500,
                letterSpacing: 0.2,
              }}
            >
              {hostByline}
            </div>
          )}
          <div
            style={{
              marginTop: hostByline ? 12 : 10,
              height: 4,
              width: 88,
              background: "#E8A817",
              borderRadius: 2,
            }}
          />
        </div>

        <div style={{ display: "flex", flex: 1, marginTop: 20, overflow: "hidden" }}>
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
            <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
              {columns.map((col, ci) => (
                <div
                  key={ci}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    minWidth: 0,
                    marginRight: ci < columns.length - 1 ? (columnCount === 3 ? 32 : 48) : 0,
                    overflow: "hidden",
                  }}
                >
                  {col.map((g) => {
                    const preview = g.items.slice(0, previewCount);
                    return (
                      <div
                        key={g.key}
                        style={{ display: "flex", flexDirection: "column", marginBottom: 14 }}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <div style={{ display: "flex", fontSize: 26, marginRight: 10 }}>
                            {g.emoji}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              fontSize: 24,
                              fontWeight: 700,
                              color: "#292524",
                              marginRight: 8,
                              fontFamily: serifStack,
                            }}
                          >
                            {g.label}
                          </div>
                          <div style={{ display: "flex", fontSize: 18, color: "#A8A29E" }}>
                            · {g.items.length}
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", marginTop: 4 }}>
                          {preview.map((f, i) => (
                            <div
                              key={i}
                              style={{
                                display: "block",
                                fontSize: 22,
                                color: "#292524",
                                marginTop: 2,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {`· ${f.title || "Untitled"}`}
                            </div>
                          ))}
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
          <div style={{ display: "flex", color: "#E8A817", fontWeight: 600 }}>tap to join →</div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
