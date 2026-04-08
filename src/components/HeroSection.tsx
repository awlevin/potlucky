"use client"

import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react"
import { motion } from "framer-motion"
import { useColorModeValue } from "@/components/ui/color-mode"

interface HeroSectionProps {
  onStart: () => void
  loading: boolean
}

const FLOATING_EMOJIS = [
  { emoji: "🥘", top: "12%", left: "8%", size: "2.5rem", delay: 0 },
  { emoji: "🍕", top: "20%", right: "10%", size: "2rem", delay: 0.5 },
  { emoji: "🥗", bottom: "25%", left: "12%", size: "2.2rem", delay: 1.0 },
  { emoji: "🧁", top: "35%", right: "6%", size: "2.8rem", delay: 1.5 },
  { emoji: "🍲", bottom: "15%", right: "15%", size: "2rem", delay: 2.0 },
  { emoji: "🥖", top: "60%", left: "5%", size: "2.3rem", delay: 0.8 },
  { emoji: "🧀", bottom: "35%", right: "8%", size: "2.1rem", delay: 1.3 },
  { emoji: "🍷", top: "10%", left: "70%", size: "2rem", delay: 1.8 },
]

export function HeroSection({ onStart, loading }: HeroSectionProps) {
  const heroBg = useColorModeValue(
    "linear-gradient(135deg, #FFF8E7 0%, #FFF7ED 40%, #FFEFC2 70%, #FEF0ED 100%)",
    "linear-gradient(135deg, #1a1a2e 0%, #16213e 40%, #1a1a2e 70%, #0f3460 100%)",
  )

  return (
    <Box
      as="section"
      position="relative"
      overflow="hidden"
      w="full"
      py={{ base: 16, md: 24 }}
      style={{
        background: heroBg,
      }}
    >
      {/* Floating food emojis */}
      {FLOATING_EMOJIS.map(({ emoji, delay, size, ...pos }) => (
        <motion.span
          key={emoji}
          animate={{ y: [0, -10, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay,
          }}
          style={{
            position: "absolute",
            fontSize: size,
            opacity: 0.3,
            pointerEvents: "none",
            userSelect: "none",
            ...pos,
          }}
        >
          {emoji}
        </motion.span>
      ))}

      {/* Main content */}
      <Flex
        direction="column"
        alignItems="center"
        textAlign="center"
        position="relative"
        zIndex={1}
        px={{ base: 4, md: 8 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Heading
            as="h1"
            fontSize={{ base: "2xl", md: "4xl", lg: "5xl" }}
            fontWeight={800}
            color="text.primary"
            mb={4}
          >
            Every great meal starts with great friends.
          </Heading>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Text
            fontSize={{ base: "md", md: "lg" }}
            color="text.secondary"
            maxW="lg"
            mb={8}
          >
            Plan your potluck in seconds. Share a link, claim dishes, and feast
            together.
          </Text>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
            <Button size="lg" onClick={onStart} disabled={loading}>
              {loading ? "Setting the table..." : "Start a Potluck 🎉"}
            </Button>
          </motion.div>
        </motion.div>
      </Flex>
    </Box>
  )
}
