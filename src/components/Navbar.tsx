"use client"

import Link from "next/link"
import dynamic from "next/dynamic"

// NavMenu depends on useLocalStorage (client-only) — render only after hydration.
// The placeholder reserves the trigger's footprint to avoid layout shift.
const NavMenu = dynamic(() => import("@/components/NavMenu").then((m) => m.NavMenu), {
  ssr: false,
  loading: () => <div className="nav-menu-placeholder" aria-hidden="true" />,
})

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
        <NavMenu />
      </div>
    </nav>
  )
}
