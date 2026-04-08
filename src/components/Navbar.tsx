"use client"

import Link from "next/link"
import { ColorModeButton } from "@/components/ui/color-mode"

export function Navbar() {
  return (
    <nav className="navbar">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          maxWidth: "64rem",
          margin: "0 auto",
        }}
      >
        <Link
          href="/"
          style={{
            textDecoration: "none",
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontWeight: 700,
            fontSize: "1.25rem",
            color: "var(--color-brand)",
          }}
        >
          🍲 Potlucky
        </Link>
        <ColorModeButton />
      </div>
    </nav>
  )
}
