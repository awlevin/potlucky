"use client"

import { Box, Flex, Text } from "@chakra-ui/react"
import Link from "next/link"
import { ColorModeButton, useColorModeValue } from "@/components/ui/color-mode"

export function Navbar() {
  const navBg = useColorModeValue(
    "rgba(255,252,245,0.85)",
    "rgba(28,25,23,0.85)"
  )

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={10}
      bg={navBg}
      backdropFilter="blur(12px)"
      borderBottom="1px solid"
      borderColor="border.default"
    >
      <Flex
        justifyContent="space-between"
        alignItems="center"
        px={{ base: 4, md: 8 }}
        py={4}
        maxW="5xl"
        mx="auto"
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <Text
            fontSize="xl"
            fontWeight="bold"
            fontFamily="var(--font-fraunces), Georgia, serif"
            color="brand.600"
          >
            🍲 Potlucky
          </Text>
        </Link>
        <ColorModeButton />
      </Flex>
    </Box>
  )
}
