import { defineRecipe } from "@chakra-ui/react"

export const inputRecipe = defineRecipe({
  className: "chakra-input",
  base: {
    width: "100%",
    borderRadius: "lg",
    borderWidth: "1px",
    borderColor: "border.default",
    bg: "bg.surface",
    color: "text.primary",
    transition: "all 0.2s ease",
    _placeholder: {
      color: "text.muted",
    },
    _focusVisible: {
      borderColor: "brand.400",
      boxShadow: "0 0 0 1px var(--chakra-colors-brand-400)",
      outline: "none",
    },
    _hover: {
      borderColor: "brand.300",
    },
  },
  variants: {
    size: {
      sm: {
        fontSize: "sm",
        px: "3",
        py: "1.5",
        height: "8",
      },
      md: {
        fontSize: "md",
        px: "4",
        py: "2",
        height: "10",
      },
      lg: {
        fontSize: "lg",
        px: "5",
        py: "3",
        height: "12",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
})
