"use client"

import { useState } from "react"
import { pickRandomFooterTagline } from "@/lib/footerTaglines"

export function Footer() {
  const [tagline] = useState(pickRandomFooterTagline)
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
