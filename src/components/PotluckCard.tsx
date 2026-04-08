"use client"

import { IPrevRoom } from "@/utils/misc"

const FOOD_EMOJIS = ["🍕", "🥗", "🧁", "🍲", "🥘", "🍰", "🌮", "🥖", "🍝", "🧀", "🥧", "🍣"]

function getEmojiForName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i)
    hash |= 0
  }
  return FOOD_EMOJIS[Math.abs(hash) % FOOD_EMOJIS.length]
}

function formatRelativeDate(dateStr?: string): string {
  if (!dateStr) return "Visited recently"

  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Last visited: today"
  if (diffDays === 1) return "Last visited: yesterday"
  if (diffDays < 7) return `Last visited: ${diffDays} days ago`
  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks === 1) return "Last visited: 1 week ago"
  return `Last visited: ${diffWeeks} weeks ago`
}

interface PotluckCardProps {
  room: IPrevRoom
  onNavigate: (id: string) => void
  onRemove: (id: string) => void
}

export function PotluckCard({ room, onNavigate, onRemove }: PotluckCardProps) {
  const emoji = getEmojiForName(room.name || room.id)

  return (
    <div
      className="potluck-card"
      tabIndex={0}
      role="button"
      onClick={() => onNavigate(room.id)}
      onKeyDown={(e) => {
        if (
          (e.key === "Enter" || e.key === " ") &&
          e.target === e.currentTarget
        ) {
          e.preventDefault()
          onNavigate(room.id)
        }
      }}
    >
      {/* Food emoji accent */}
      <span
        style={{
          position: "absolute",
          top: "8px",
          right: "32px",
          fontSize: "1.125rem",
          opacity: 0.5,
          pointerEvents: "none",
          transition: "all 0.3s ease",
        }}
      >
        {emoji}
      </span>

      {/* Remove button */}
      <button
        aria-label={`Remove ${room.name}`}
        className="btn btn-ghost btn-icon btn-xs"
        style={{
          position: "absolute",
          top: "8px",
          right: "8px",
          opacity: 0,
          transition: "opacity 0.2s",
        }}
        onClick={(e) => {
          e.stopPropagation()
          onRemove(room.id)
        }}
        onMouseEnter={(e) => { (e.currentTarget.style.opacity = "1") }}
        onMouseLeave={(e) => { (e.currentTarget.style.opacity = "0") }}
      >
        &times;
      </button>

      <p
        style={{
          fontFamily: "var(--font-fraunces), Georgia, serif",
          fontWeight: 600,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          color: "var(--color-text)",
          paddingRight: "2.5rem",
        }}
      >
        {room.name}
      </p>

      <p
        style={{
          fontSize: "0.875rem",
          color: "var(--color-text-muted)",
          marginTop: "4px",
        }}
      >
        {formatRelativeDate(room.lastVisited)}
      </p>
    </div>
  )
}
