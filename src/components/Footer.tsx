"use client"

import { Box, Text } from "@chakra-ui/react"

export function Footer() {
  return (
    <Box
      as="footer"
      py={12}
      mt={16}
      borderTop="1px solid"
      borderColor="border.default"
      textAlign="center"
    >
      <Text color="text.muted" fontSize="sm">
        Made with 🍳 for friends who feast together
      </Text>
      <Text color="text.muted" fontSize="xs" mt={2}>
        Potlucky &copy; 2024
      </Text>
    </Box>
  )
}
