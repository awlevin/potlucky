"use client"

import { Box, IconButton, Text } from "@chakra-ui/react"
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
    <Box
      position="relative"
      bg="bg.surface"
      rounded="xl"
      border="1px solid"
      borderColor="border.default"
      p={4}
      cursor="pointer"
      transition="all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
      boxShadow="0 2px 8px rgba(0,0,0,0.04)"
      _hover={{
        boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        transform: "translateY(-2px)",
        borderColor: "brand.300",
      }}
      _focusVisible={{
        outline: "2px solid",
        outlineColor: "brand.500",
        outlineOffset: "2px",
      }}
      tabIndex={0}
      onKeyDown={(e) => {
        if (
          (e.key === "Enter" || e.key === " ") &&
          e.target === e.currentTarget
        ) {
          e.preventDefault()
          onNavigate(room.id)
        }
      }}
      onClick={() => onNavigate(room.id)}
      role="group"
      overflow="hidden"
    >
      {/* Food emoji accent */}
      <Box
        position="absolute"
        top={2}
        right={8}
        fontSize="lg"
        opacity={0.5}
        transition="all 0.3s ease"
        _groupHover={{
          transform: "rotate(15deg) scale(1.2)",
          opacity: 0.8,
        }}
        pointerEvents="none"
      >
        {emoji}
      </Box>

      <IconButton
        aria-label={`Remove ${room.name}`}
        size="xs"
        variant="ghost"
        position="absolute"
        top={2}
        right={2}
        opacity={0}
        _groupHover={{ opacity: 1 }}
        transition="opacity 0.2s"
        onClick={(e) => {
          e.stopPropagation()
          onRemove(room.id)
        }}
      >
        &times;
      </IconButton>

      <Text
        fontFamily="var(--font-fraunces), serif"
        fontWeight={600}
        overflow="hidden"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
        color="text.primary"
        pr={10}
      >
        {room.name}
      </Text>

      <Text fontSize="sm" color="text.muted" mt={1}>
        {formatRelativeDate(room.lastVisited)}
      </Text>
    </Box>
  )
}
