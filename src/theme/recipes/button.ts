import { defineRecipe } from "@chakra-ui/react"

export const buttonRecipe = defineRecipe({
  className: "chakra-button",
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "600",
    borderRadius: "full",
    cursor: "pointer",
    transition: "all 0.2s ease",
    _focusVisible: {
      outline: "2px solid",
      outlineColor: "brand.400",
      outlineOffset: "2px",
    },
  },
  variants: {
    variant: {
      solid: {
        bg: "brand.500",
        color: "gray.800",
        boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
        _hover: {
          bg: "brand.600",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
        },
        _active: {
          bg: "brand.700",
        },
      },
      ghost: {
        bg: "transparent",
        color: "text.primary",
        _hover: {
          bg: "cream.100",
        },
        _active: {
          bg: "cream.200",
        },
      },
      outline: {
        bg: "transparent",
        borderWidth: "1px",
        borderColor: "brand.500",
        color: "brand.700",
        _hover: {
          bg: "brand.50",
        },
        _active: {
          bg: "brand.100",
        },
      },
      danger: {
        bg: "warm.500",
        color: "white",
        boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)",
        _hover: {
          bg: "warm.600",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)",
        },
        _active: {
          bg: "warm.700",
        },
      },
    },
    size: {
      sm: {
        fontSize: "sm",
        px: "4",
        py: "2",
        height: "8",
      },
      md: {
        fontSize: "md",
        px: "6",
        py: "3",
        height: "10",
      },
      lg: {
        fontSize: "lg",
        px: "8",
        py: "4",
        height: "12",
      },
      xl: {
        fontSize: "xl",
        px: "10",
        py: "5",
        height: "14",
      },
    },
  },
  defaultVariants: {
    variant: "solid",
    size: "md",
  },
})
