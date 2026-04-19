"use client"

import { motion } from "framer-motion"

interface HeroSectionProps {
  onStart: () => void
  loading: boolean
}

const FLOATING_EMOJIS = [
  { emoji: "🥘", top: "8%", left: "6%", size: "3.5rem", delay: 0 },
  { emoji: "🍕", top: "15%", right: "8%", size: "3rem", delay: 0.5 },
  { emoji: "🥗", bottom: "20%", left: "10%", size: "3.2rem", delay: 1.0 },
  { emoji: "🧁", top: "40%", right: "4%", size: "3.8rem", delay: 1.5 },
  { emoji: "🍲", bottom: "10%", right: "12%", size: "3rem", delay: 2.0 },
  { emoji: "🥖", top: "65%", left: "3%", size: "3.3rem", delay: 0.8 },
  { emoji: "🧀", bottom: "30%", right: "6%", size: "3.1rem", delay: 1.3 },
  { emoji: "🍷", top: "8%", left: "72%", size: "3rem", delay: 1.8 },
]

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`

export function HeroSection({ onStart, loading }: HeroSectionProps) {
  return (
    <div className="hero">
      {/* Noise texture overlay */}
      <div className="noise-overlay" />

      {/* Floating food emojis */}
      {FLOATING_EMOJIS.map(({ emoji, delay, size, ...pos }) => (
        <motion.span
          key={emoji}
          animate={{
            y: [0, -12, 0],
            rotate: [-3, 3, -3],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay,
          }}
          style={{
            position: "absolute",
            fontSize: size,
            opacity: 0.15,
            pointerEvents: "none",
            userSelect: "none",
            ...pos,
          }}
        >
          {emoji}
        </motion.span>
      ))}

      {/* Main content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          padding: "0 16px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h1 className="hero-heading">
            Great meals start with great friends
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <p
            style={{
              fontSize: "1.125rem",
              color: "var(--color-text-secondary)",
              maxWidth: "28rem",
              marginBottom: "2rem",
              marginTop: "1rem",
              lineHeight: 1.6,
            }}
          >
            Plan your potluck in seconds. Share a link, claim dishes, and feast
            together.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, duration: 0.4 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            animate={{
              boxShadow: [
                "0 4px 12px rgba(232,168,23,0.2)",
                "0 4px 20px rgba(232,168,23,0.4)",
                "0 4px 12px rgba(232,168,23,0.2)",
              ],
            }}
            transition={{
              boxShadow: {
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              },
            }}
            style={{ borderRadius: "var(--radius-lg)" }}
          >
            <button
              className="btn btn-lg"
              onClick={onStart}
              disabled={loading}
            >
              {loading ? "Setting the table..." : "Start a Potluck \u2192"}
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
