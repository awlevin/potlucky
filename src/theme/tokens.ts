import { defineTokens, defineSemanticTokens } from "@chakra-ui/react"

export const tokens = defineTokens({
  colors: {
    // Warm amber/honey tones — primary actions, hero gradient
    brand: {
      50: { value: "#FFF8E7" },
      100: { value: "#FFEFC2" },
      200: { value: "#FFE299" },
      300: { value: "#FFD56F" },
      400: { value: "#FFC84A" },
      500: { value: "#FFBA24" },
      600: { value: "#E5A00D" },
      700: { value: "#B87D0A" },
      800: { value: "#8A5D08" },
      900: { value: "#5C3E05" },
    },
    // Sage green tones — success states, claimed items, active selections
    accent: {
      50: { value: "#F0F7F0" },
      100: { value: "#D4ECD4" },
      200: { value: "#B0DCB0" },
      300: { value: "#8BCC8B" },
      400: { value: "#6BB96B" },
      500: { value: "#4EA24E" },
      600: { value: "#3E823E" },
      700: { value: "#2F632F" },
      800: { value: "#204420" },
      900: { value: "#122612" },
    },
    // Terracotta/coral — secondary accents, delete confirmations
    warm: {
      50: { value: "#FEF0ED" },
      100: { value: "#FDD9D1" },
      200: { value: "#FBBCAE" },
      300: { value: "#F89C88" },
      400: { value: "#F57D64" },
      500: { value: "#E8603E" },
      600: { value: "#C94A2B" },
      700: { value: "#A33821" },
      800: { value: "#7D2A18" },
      900: { value: "#571D10" },
    },
    // Soft off-whites and warm grays — backgrounds, cards, surfaces
    cream: {
      50: { value: "#FFFCF7" },
      100: { value: "#FFF7ED" },
      200: { value: "#FFEED6" },
      300: { value: "#FFE4BF" },
      400: { value: "#F5D5A8" },
      500: { value: "#E8C794" },
      600: { value: "#C9A872" },
      700: { value: "#A38856" },
      800: { value: "#7D6940" },
      900: { value: "#574A2D" },
    },
  },
})

export const semanticTokens = defineSemanticTokens({
  colors: {
    bg: {
      canvas: {
        value: { _light: "{colors.cream.50}", _dark: "{colors.gray.900}" },
      },
      surface: {
        value: { _light: "{colors.white}", _dark: "{colors.gray.800}" },
      },
      muted: {
        value: { _light: "{colors.cream.100}", _dark: "{colors.gray.700}" },
      },
    },
    text: {
      primary: {
        value: { _light: "{colors.gray.800}", _dark: "{colors.cream.50}" },
      },
      secondary: {
        value: { _light: "{colors.gray.600}", _dark: "{colors.cream.200}" },
      },
      muted: {
        value: { _light: "{colors.gray.500}", _dark: "{colors.cream.400}" },
      },
    },
    border: {
      default: {
        value: { _light: "{colors.cream.300}", _dark: "{colors.gray.600}" },
      },
    },
  },
})
