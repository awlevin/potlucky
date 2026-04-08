"use client"

import { Box, Text } from "@chakra-ui/react"

export function Footer() {
  return (
    <Box
      as="footer"
      py={16}
      mt={20}
      borderTop="1px solid"
      borderColor="border.default"
      textAlign="center"
    >
      <Text
        color="text.secondary"
        fontSize="sm"
        fontFamily="var(--font-fraunces), serif"
        fontStyle="italic"
        mb={4}
      >
        Made with care for friends who feast together
      </Text>
      <Box
        w={1.5}
        h={1.5}
        bg="brand.400"
        borderRadius="full"
        mx="auto"
        mb={4}
      />
      <Text color="text.muted" fontSize="xs">
        Potlucky &copy; {new Date().getFullYear()}
      </Text>
    </Box>
  )
}
