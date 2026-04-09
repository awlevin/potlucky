"use client";

import { useState } from "react";
import { Food, User } from "@/types";
import { toaster } from "@/components/ui/toaster";
import { DietaryBadges } from "@/components/IdentityGate";

interface SummaryPanelProps {
  foods: Food[];
  users: User[];
  currUser: User | undefined;
  roomName: string;
}

export function SummaryPanel({ foods, users, currUser, roomName }: SummaryPanelProps) {
  const [expanded, setExpanded] = useState(false);

  // Group foods by claimant (supports multi-claimer)
  const grouped = new Map<string | null, Food[]>();
  for (const food of foods) {
    const claimerIds = Array.isArray(food.claimedBy)
      ? food.claimedBy
      : food.claimedBy
      ? [food.claimedBy]
      : [];
    if (claimerIds.length === 0) {
      if (!grouped.has(null)) grouped.set(null, []);
      grouped.get(null)!.push(food);
    } else {
      for (const uid of claimerIds) {
        if (!grouped.has(uid)) grouped.set(uid, []);
        grouped.get(uid)!.push(food);
      }
    }
  }

  // Build ordered sections: current user first, then others alphabetically, then unclaimed
  const sections: { userId: string | null; name: string; items: Food[] }[] = [];

  // Current user first (if they have items)
  if (currUser && grouped.has(currUser.id)) {
    sections.push({
      userId: currUser.id,
      name: currUser.name,
      items: grouped.get(currUser.id)!,
    });
  }

  // Other users alphabetically
  const otherUserIds = Array.from(grouped.keys()).filter(
    (key) => key !== null && key !== currUser?.id
  );
  otherUserIds
    .map((uid) => {
      const user = users.find((u) => u.id === uid);
      return { userId: uid, name: user?.name ?? "Unknown", items: grouped.get(uid)! };
    })
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((s) => sections.push(s));

  // Unclaimed at the end
  if (grouped.has(null)) {
    sections.push({ userId: null, name: "Unclaimed", items: grouped.get(null)! });
  }

  const handleCopy = async () => {
    const lines: string[] = [];
    const heading = roomName ? `Potluck Menu - ${roomName}` : "Potluck Menu";
    lines.push(`\uD83C\uDF7D\uFE0F ${heading}`);
    lines.push("");

    for (const section of sections) {
      if (section.userId === null) {
        lines.push("Unclaimed:");
      } else {
        const count = section.items.length;
        lines.push(`${section.name} (${count} ${count === 1 ? "dish" : "dishes"}):`);
      }
      for (const item of section.items) {
        lines.push(`\u2022 ${item.title}`);
      }
      lines.push("");
    }

    const text = lines.join("\n").trimEnd();

    try {
      await navigator.clipboard.writeText(text);
      toaster.create({
        title: "Copied to clipboard",
        type: "success",
      });
    } catch {
      toaster.create({
        title: "Failed to copy",
        type: "error",
      });
    }
  };

  if (foods.length === 0) return null;

  return (
    <div className="summary-panel">
      <div
        className="summary-header"
        onClick={() => setExpanded((prev) => !prev)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setExpanded((prev) => !prev);
          }
        }}
        aria-expanded={expanded}
      >
        <span>{"\uD83D\uDCCB"} Summary</span>
        <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
          {expanded ? "\u25B2" : "\u25BC"}
        </span>
      </div>

      {expanded && (
        <div className="summary-content">
          {sections.map((section) => (
            <div className="summary-person" key={section.userId ?? "__unclaimed"}>
              <div
                className={`summary-person-name${
                  section.userId === null
                    ? " summary-unclaimed"
                    : section.userId === currUser?.id
                      ? " is-you"
                      : ""
                }`}
              >
                {section.userId === null
                  ? "Unclaimed"
                  : (
                    <>
                      {section.name}
                      {(() => {
                        const u = users.find((u) => u.id === section.userId);
                        return u ? (
                          <DietaryBadges
                            restrictions={u.dietaryRestrictions}
                            note={u.dietaryNote}
                            size="xs"
                          />
                        ) : null;
                      })()}
                      {` (${section.items.length} ${section.items.length === 1 ? "dish" : "dishes"})`}
                    </>
                  )}
              </div>
              {section.items.map((item) => (
                <div className="summary-item" key={item.id}>
                  {"\u2022"} {item.title}
                </div>
              ))}
            </div>
          ))}

          <div style={{ marginTop: "12px" }}>
            <button className="btn btn-sm btn-outline" onClick={handleCopy}>
              Copy Summary
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
