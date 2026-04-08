import { defineRecipe } from "@chakra-ui/react"

export const inputRecipe = defineRecipe({
  className: "chakra-input",
  base: {
    width: "100%",
    borderRadius: "xl",
    borderWidth: "1.5px",
    borderColor: "border.default",
    bg: "bg.surface",
    color: "text.primary",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
    _placeholder: {
      color: "text.muted",
    },
    _focusVisible: {
      borderColor: "brand.400",
      boxShadow: "0 0 0 3px rgba(232, 168, 23, 0.15)",
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
        height: "11",
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
