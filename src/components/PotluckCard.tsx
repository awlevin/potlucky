"use client"

import { Box, IconButton, Text } from "@chakra-ui/react"
import { IPrevRoom } from "@/utils/misc"

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
  return (
    <Box
      position="relative"
      bg="bg.surface"
      rounded="xl"
      shadow="sm"
      border="1px solid"
      borderColor="border.default"
      p={4}
      cursor="pointer"
      transition="all 0.2s"
      _hover={{
        shadow: "md",
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
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onNavigate(room.id)
        }
      }}
      onClick={() => onNavigate(room.id)}
      role="group"
    >
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
        fontWeight={600}
        overflow="hidden"
        textOverflow="ellipsis"
        whiteSpace="nowrap"
        color="text.primary"
        pr={6}
      >
        {room.name}
      </Text>

      <Text fontSize="sm" color="text.muted" mt={1}>
        {formatRelativeDate(room.lastVisited)}
      </Text>
    </Box>
  )
}
