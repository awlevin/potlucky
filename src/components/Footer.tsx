"use client"

import { useEffect, useState } from "react"
import { FOOTER_TAGLINES, pickRandomFooterTagline } from "@/lib/footerTaglines"

export function Footer() {
  // Server and first client render must match, so start from a fixed
  // tagline and shuffle only after hydration.
  const [tagline, setTagline] = useState(FOOTER_TAGLINES[0])
  useEffect(() => {
    setTagline(pickRandomFooterTagline())
  }, [])
  return (
    <footer className="footer">
      <p className="footer-tagline">
        {tagline}
      </p>
      <div className="footer-dot" />
      <p className="footer-copyright">
        Potlucky &copy; {new Date().getFullYear()}
      </p>
    </footer>
  )
}
