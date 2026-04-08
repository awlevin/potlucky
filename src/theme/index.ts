import { createSystem, defineConfig } from "@chakra-ui/react"
import { tokens, semanticTokens } from "./tokens"
import { buttonRecipe } from "./recipes/button"
import { inputRecipe } from "./recipes/input"
import { headingRecipe } from "./recipes/heading"

const config = defineConfig({
  theme: {
    tokens,
    semanticTokens,
    recipes: {
      button: buttonRecipe,
      input: inputRecipe,
      heading: headingRecipe,
    },
  },
  globalCss: {
    body: {
      bg: "bg.canvas",
      color: "text.primary",
    },
  },
})

export const system = createSystem(config)
