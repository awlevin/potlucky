"use client"

import { ThemeProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import { LuMoon, LuSun } from "react-icons/lu"

export interface ColorModeProviderProps extends ThemeProviderProps {}

export function ColorModeProvider(props: ColorModeProviderProps) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
  )
}

export function useColorMode() {
  const { resolvedTheme, setTheme } = useTheme()
  const toggleColorMode = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light")
  }
  return {
    colorMode: resolvedTheme,
    setColorMode: setTheme,
    toggleColorMode,
  }
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode()
  return colorMode === "light" ? light : dark
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode()
  return colorMode === "light" ? <LuSun /> : <LuMoon />
}

export function ColorModeButton() {
  const { toggleColorMode, colorMode } = useColorMode()

  // Avoid hydration mismatch — render nothing until mounted
  if (!colorMode) {
    return <div className="color-mode-btn" style={{ visibility: "hidden" }} />
  }

  return (
    <button
      className="color-mode-btn"
      onClick={toggleColorMode}
      aria-label="Toggle color mode"
      type="button"
    >
      {colorMode === "light" ? <LuSun /> : <LuMoon />}
    </button>
  )
}
