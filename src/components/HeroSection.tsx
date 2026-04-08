"use client"

import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react"
import { motion } from "framer-motion"
import { useColorModeValue } from "@/components/ui/color-mode"

interface HeroSectionProps {
  onStart: () => void
  loading: boolean
}

const FLOATING_EMOJIS = [
  { emoji: "🥘", top: "8%", left: "6%", size: "3.5rem", delay: 0 },
  { emoji: "🍕", top: "15%", right: "8%", size: "3rem", delay: 0.5 },
  { emoji: "🥗", bottom: "20%", left: "10%", size: "3.2rem", delay: 1.0 },
  { emoji: "🧁", top: "40%", right: "4%", size: "3.8rem", delay: 1.5 },
  { emoji: "🍲", bottom: "10%", right: "12%", size: "3rem", delay: 2.0 },
  { emoji: "🥖", top: "65%", left: "3%", size: "3.3rem", delay: 0.8 },
  { emoji: "🧀", bottom: "30%", right: "6%", size: "3.1rem", delay: 1.3 },
  { emoji: "🍷", top: "8%", left: "72%", size: "3rem", delay: 1.8 },
]

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`

export function HeroSection({ onStart, loading }: HeroSectionProps) {
  const heroBg = useColorModeValue(
    "linear-gradient(160deg, #FFFCF5 0%, #FFF0C7 35%, #FEF1ED 65%, #FFFCF5 100%)",
    "linear-gradient(160deg, #1C1917 0%, #292524 35%, #2C2520 65%, #1C1917 100%)",
  )
  const noiseOpacity = useColorModeValue(0.03, 0.05)
  const textShadow = useColorModeValue("none", "0 2px 8px rgba(0,0,0,0.3)")

  return (
    <Box
      position="relative"
      overflow="hidden"
      w="full"
      py={{ base: 20, md: 32 }}
      style={{
        background: heroBg,
      }}
    >
      {/* Noise texture overlay */}
      <Box
        position="absolute"
        inset={0}
        backgroundImage={NOISE_SVG}
        backgroundRepeat="repeat"
        opacity={noiseOpacity}
        pointerEvents="none"
      />

      {/* Floating food emojis */}
      {FLOATING_EMOJIS.map(({ emoji, delay, size, ...pos }) => (
        <motion.span
          key={emoji}
          animate={{
            y: [0, -12, 0],
            rotate: [-3, 3, -3],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay,
          }}
          style={{
            position: "absolute",
            fontSize: size,
            opacity: 0.15,
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
            fontFamily="var(--font-fraunces), Georgia, serif"
            fontSize={{ base: "3xl", sm: "4xl", md: "5xl", lg: "6xl" }}
            fontWeight={600}
            fontVariationSettings="'SOFT' 50, 'WONK' 1"
            color="text.primary"
            mb={4}
            textShadow={textShadow}
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
            fontSize="lg"
            color="text.secondary"
            maxW="md"
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
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            animate={{
              boxShadow: [
                "0 4px 12px rgba(232,168,23,0.2)",
                "0 4px 20px rgba(232,168,23,0.4)",
                "0 4px 12px rgba(232,168,23,0.2)",
              ],
            }}
            transition={{
              boxShadow: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            style={{ borderRadius: "var(--chakra-radii-xl)" }}
          >
            <Button size="lg" onClick={onStart} disabled={loading}>
              {loading ? "Setting the table..." : "Start a Potluck →"}
            </Button>
          </motion.div>
        </motion.div>
      </Flex>
    </Box>
  )
}
