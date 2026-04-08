"use client"

import { Box, Flex, Text } from "@chakra-ui/react"
import Link from "next/link"
import { ColorModeButton } from "@/components/ui/color-mode"

export function Navbar() {
  return (
    <Box
      position="sticky"
      top={0}
      zIndex={10}
      bg="bg.surface"
      borderBottom="1px solid"
      borderColor="border.default"
    >
      <Flex
        justifyContent="space-between"
        alignItems="center"
        px={{ base: 4, md: 8 }}
        py={3}
        maxW="4xl"
        mx="auto"
      >
        <Link href="/" style={{ textDecoration: "none" }}>
          <Text fontSize="xl" fontWeight="bold" color="brand.600">
            🍲 Potlucky
          </Text>
        </Link>
        <ColorModeButton />
      </Flex>
    </Box>
  )
}
