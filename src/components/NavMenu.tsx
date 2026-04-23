"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useLocalStorage } from "@uidotdev/usehooks"
import { AnimatePresence, motion } from "framer-motion"
import { LuMoon, LuSun } from "react-icons/lu"
import { useColorMode } from "@/components/ui/color-mode"
import { featureFlags } from "@/lib/featureFlags"
import { IPrevRoom } from "@/utils/misc"
import { getUpcomingPresets, PotluckPreset } from "@/data/presets"

const EASE = [0.22, 1, 0.36, 1] as const

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  return Math.ceil((d.getTime() - Date.now()) / 86_400_000)
}

function formatDaysAway(days: number): string {
  if (days < 0) return "just passed"
  if (days === 0) return "today"
  if (days === 1) return "tomorrow"
  if (days < 7) return `in ${days} days`
  if (days < 14) return "next week"
  if (days < 30) return `in ${days} days`
  if (days < 60) return "next month"
  return `in ${Math.round(days / 30)} months`
}

function formatRelative(iso?: string): string {
  if (!iso) return ""
  const diffMs = Date.now() - new Date(iso).getTime()
  const day = 86_400_000
  const days = Math.floor(diffMs / day)
  if (days < 1) return "today"
  if (days === 1) return "yesterday"
  if (days < 7) return `${days} days ago`
  if (days < 14) return "last week"
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 60) return "last month"
  return `${Math.floor(days / 30)} months ago`
}

// Dish emoji inference from the room name — light touch, defaults to bowl.
function emojiFor(name: string): string {
  const n = name.toLowerCase()
  if (/taco|burrito|cinco/.test(n)) return "🌮"
  if (/brunch|mimosa/.test(n)) return "🥂"
  if (/pasta|spaghetti|italian/.test(n)) return "🍝"
  if (/bbq|cookout|grill|burger/.test(n)) return "🍔"
  if (/thanks|friendsgiving|turkey/.test(n)) return "🦃"
  if (/christmas|holiday/.test(n)) return "🎄"
  if (/birthday/.test(n)) return "🎂"
  if (/halloween|pumpkin/.test(n)) return "🎃"
  if (/book|club/.test(n)) return "📚"
  if (/noodle|ramen/.test(n)) return "🍜"
  if (/game|super bowl|football/.test(n)) return "🏈"
  if (/salad|veg|garden/.test(n)) return "🥗"
  return "🍲"
}

export function NavMenu() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [prevRooms] = useLocalStorage<IPrevRoom[]>("prevRooms", [])
  const { colorMode, toggleColorMode } = useColorMode()
  const router = useRouter()
  const pathname = usePathname()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  // Dismiss on outside click + Escape; restore focus to trigger on Escape.
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (
        panelRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      ) return
      setOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener("mousedown", handleClick)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleClick)
      document.removeEventListener("keydown", handleKey)
    }
  }, [open])

  // Close when the route changes (navigating to a clicked row).
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const recentRooms = useMemo(
    () =>
      [...prevRooms]
        .sort(
          (a, b) =>
            new Date(b.lastVisited || 0).getTime() -
            new Date(a.lastVisited || 0).getTime(),
        )
        .slice(0, 4),
    [prevRooms],
  )

  const upcoming: PotluckPreset | undefined = useMemo(
    () => getUpcomingPresets().find((p) => p.marketing?.slug),
    [],
  )
  const upcomingDays = upcoming?.date ? daysUntil(upcoming.date) : null

  const isNewUser = mounted && prevRooms.length === 0
  // Show the honey dot as a gentle nudge when there's something to notice:
  // a brand-new user, OR a big holiday within two weeks.
  const showDot =
    mounted && (isNewUser || (upcomingDays !== null && upcomingDays <= 14 && upcomingDays >= 0))

  const triggerLabel = isNewUser ? "Get started" : "Your potlucks"

  return (
    <div className="nav-menu">
      <button
        ref={triggerRef}
        type="button"
        className="nav-menu-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="nav-menu-panel"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="nav-menu-icon" aria-hidden="true" data-open={open}>
          <span />
          <span />
          <span />
        </span>
        <span className="nav-menu-label">{triggerLabel}</span>
        {showDot && <span className="nav-menu-dot" aria-hidden="true" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id="nav-menu-panel"
            role="menu"
            aria-label="Your potlucks menu"
            className="nav-menu-panel"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.22, ease: EASE }}
          >
            <div className="nav-menu-inner">
              {isNewUser ? (
                <EmptyState upcoming={upcoming} upcomingDays={upcomingDays} />
              ) : (
                <PopulatedState
                  rooms={recentRooms}
                  onNavigate={(id) => router.push(`/potlucks/${id}`)}
                  upcoming={upcoming}
                  upcomingDays={upcomingDays}
                />
              )}

              <motion.footer
                className="nav-menu-footer"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, ease: EASE, delay: 0.18 }}
              >
                <button
                  type="button"
                  className="nav-menu-theme-rail"
                  onClick={toggleColorMode}
                  aria-label={
                    colorMode === "dark" ? "Switch to light mode" : "Switch to dark mode"
                  }
                  data-mode={colorMode ?? "light"}
                >
                  <LuSun className="rail-icon rail-sun" aria-hidden="true" />
                  <LuMoon className="rail-icon rail-moon" aria-hidden="true" />
                  <span className="rail-knob" aria-hidden="true" />
                </button>
                {featureFlags.dishGallery && (
                  <Link href="/gallery" className="nav-menu-cta" role="menuitem">
                    <span aria-hidden="true" style={{ fontSize: 13, lineHeight: 1 }}>📚</span>
                    The Archive
                  </Link>
                )}
                <Link href="/" className="nav-menu-cta" role="menuitem">
                  <span className="nav-menu-plus" aria-hidden="true">+</span>
                  Start a potluck
                </Link>
              </motion.footer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function EmptyState({
  upcoming,
  upcomingDays,
}: {
  upcoming?: PotluckPreset
  upcomingDays: number | null
}) {
  return (
    <>
      <motion.div
        className="nav-menu-greeting"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: EASE, delay: 0.04 }}
      >
        a warm <strong>welcome</strong>
      </motion.div>

      <motion.div
        className="nav-menu-empty"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: EASE, delay: 0.08 }}
      >
        <div className="nav-menu-empty-visual" aria-hidden="true">
          <span className="nav-menu-empty-steam s1">·</span>
          <span className="nav-menu-empty-steam s2">·</span>
          <span className="nav-menu-empty-steam s3">·</span>
          <span className="nav-menu-empty-bowl">🍲</span>
        </div>
        <p className="nav-menu-empty-title">Your table is set.</p>
        <p className="nav-menu-empty-sub">
          Start a potluck in a minute — no accounts, no fuss. Share a link, let
          friends claim dishes.
        </p>
      </motion.div>

      {upcoming?.marketing?.slug && (
        <motion.div
          className="nav-menu-section"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: EASE, delay: 0.13 }}
        >
          <div className="nav-menu-section-head">
            <span className="nav-menu-section-title">on the horizon</span>
            {upcomingDays !== null && upcomingDays >= 0 && (
              <span className="nav-menu-section-count">
                {formatDaysAway(upcomingDays)}
              </span>
            )}
          </div>
          <UpcomingChip upcoming={upcoming} />
          <Link href="/ideas" className="nav-menu-see-more" role="menuitem">
            See more ideas
            <span aria-hidden="true">→</span>
          </Link>
        </motion.div>
      )}
    </>
  )
}

function PopulatedState({
  rooms,
  onNavigate,
  upcoming,
  upcomingDays,
}: {
  rooms: IPrevRoom[]
  onNavigate: (id: string) => void
  upcoming?: PotluckPreset
  upcomingDays: number | null
}) {
  return (
    <>
      <motion.div
        className="nav-menu-greeting"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: EASE, delay: 0.04 }}
      >
        welcome back — <strong>your potlucks</strong>
      </motion.div>

      <motion.section
        className="nav-menu-section"
        aria-label="Recent potlucks"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: EASE, delay: 0.08 }}
      >
        <div className="nav-menu-section-head">
          <span className="nav-menu-section-title">recent</span>
          <span className="nav-menu-section-count">
            {rooms.length} {rooms.length === 1 ? "potluck" : "potlucks"}
          </span>
        </div>
        <div className="nav-menu-rows">
          {rooms.map((room) => (
            <button
              key={room.id}
              type="button"
              className="nav-menu-row"
              role="menuitem"
              onClick={() => onNavigate(room.id)}
            >
              <span className="nav-menu-row-emoji" aria-hidden="true">
                {emojiFor(room.name)}
              </span>
              <span className="nav-menu-row-body">
                <span className="nav-menu-row-title">{room.name || "Untitled potluck"}</span>
                <span className="nav-menu-row-meta">
                  {formatRelative(room.lastVisited) || "just now"}
                </span>
              </span>
            </button>
          ))}
        </div>
      </motion.section>

      {upcoming?.marketing?.slug && (
        <motion.div
          className="nav-menu-section"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: EASE, delay: 0.13 }}
        >
          <div className="nav-menu-section-head">
            <span className="nav-menu-section-title">discover</span>
            {upcomingDays !== null && upcomingDays >= 0 && (
              <span className="nav-menu-section-count">
                {formatDaysAway(upcomingDays)}
              </span>
            )}
          </div>
          <UpcomingChip upcoming={upcoming} />
          <Link href="/ideas" className="nav-menu-see-more" role="menuitem">
            See more ideas
            <span aria-hidden="true">→</span>
          </Link>
        </motion.div>
      )}
    </>
  )
}

function UpcomingChip({ upcoming }: { upcoming: PotluckPreset }) {
  const slug = upcoming.marketing?.slug
  if (!slug) return null
  return (
    <Link href={`/ideas/${slug}`} className="nav-menu-upcoming" role="menuitem">
      <span className="nav-menu-upcoming-emoji" aria-hidden="true">
        {upcoming.emoji}
      </span>
      <span className="nav-menu-upcoming-body">
        <span className="nav-menu-upcoming-name">{upcoming.name}</span>
        <span className="nav-menu-upcoming-meta">
          {upcoming.dishes.length} dishes ready to claim
        </span>
      </span>
      <span className="nav-menu-upcoming-arrow" aria-hidden="true">
        →
      </span>
    </Link>
  )
}
