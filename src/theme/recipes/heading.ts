import { defineRecipe } from "@chakra-ui/react"

export const headingRecipe = defineRecipe({
  className: "chakra-heading",
  base: {
    fontFamily: "var(--font-inter), Inter, sans-serif",
    color: "text.primary",
  },
  variants: {
    size: {
      xl: {
        fontSize: "4xl",
        fontWeight: "800",
        lineHeight: "1.1",
        letterSpacing: "-0.02em",
      },
      lg: {
        fontSize: "3xl",
        fontWeight: "800",
        lineHeight: "1.2",
        letterSpacing: "-0.01em",
      },
      md: {
        fontSize: "2xl",
        fontWeight: "600",
        lineHeight: "1.3",
      },
      sm: {
        fontSize: "xl",
        fontWeight: "500",
        lineHeight: "1.4",
      },
      xs: {
        fontSize: "lg",
        fontWeight: "500",
        lineHeight: "1.4",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
})
