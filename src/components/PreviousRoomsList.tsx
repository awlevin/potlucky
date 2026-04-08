"use client"

import { useEffect, useState } from "react"
import { useLocalStorage } from "@uidotdev/usehooks"
import { useRouter } from "next/navigation"
import { IPrevRoom } from "@/utils/misc"
import { PotluckCard } from "@/components/PotluckCard"
import { AnimatePresence, motion } from "framer-motion"

export const PreviousRoomsList = () => {
  const [mounted, setMounted] = useState(false)
  const [prevRooms, setPrevRooms] = useLocalStorage<IPrevRoom[]>("prevRooms", [])
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleNavigate = (id: string) => {
    router.push(`/potlucks/${id}`)
  }

  const handleRemove = (id: string) => {
    setPrevRooms((rooms) => rooms.filter((r) => r.id !== id))
  }

  const sortedRooms = [...prevRooms].sort(
    (a, b) => new Date(b.lastVisited || 0).getTime() - new Date(a.lastVisited || 0).getTime()
  )

  if (!mounted) {
    return (
      <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "32px 16px" }}>
        <div className="prev-potlucks-grid">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                height: "100px",
                borderRadius: "var(--radius-lg)",
                background: "var(--color-border-subtle)",
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (sortedRooms.length === 0) {
    return (
      <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "32px 16px" }}>
        <h2
          className="display-heading"
          style={{ fontSize: "1.25rem", marginBottom: "16px" }}
        >
          Recent Potlucks
        </h2>
        <div
          style={{
            textAlign: "center",
            padding: "64px 16px",
            border: "2px dashed var(--color-border)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🍽️</div>
          <p
            style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontWeight: 500,
              color: "var(--color-text)",
              marginBottom: "8px",
            }}
          >
            No potlucks yet!
          </p>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
            Start one above and it&apos;ll show up here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: "48rem", margin: "0 auto", padding: "32px 16px" }}>
      <h2
        className="display-heading"
        style={{ fontSize: "1.25rem", marginBottom: "16px" }}
      >
        Recent Potlucks
      </h2>
      <div className="prev-potlucks-grid">
        <AnimatePresence>
          {sortedRooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <PotluckCard
                room={room}
                onNavigate={handleNavigate}
                onRemove={handleRemove}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default PreviousRoomsList
