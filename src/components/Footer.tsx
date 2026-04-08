"use client"

export function Footer() {
  return (
    <footer className="footer">
      <p className="footer-tagline">
        Made with care for friends who feast together
      </p>
      <div className="footer-dot" />
      <p className="footer-copyright">
        Potlucky &copy; {new Date().getFullYear()}
      </p>
    </footer>
  )
}
