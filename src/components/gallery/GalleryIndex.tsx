"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { DishCard, DishCardSkeleton } from "./DishCard";
import { GalleryHeroCollage } from "./GalleryHeroCollage";
import {
  GalleryFilters,
  type GalleryFilterState,
} from "./GalleryFilters";
import {
  galleryDishes,
  getHeroCollagePhotos,
  type GalleryDish,
} from "@/data/dishGallery";

const INITIAL_FILTERS: GalleryFilterState = {
  search: "",
  course: "all",
  season: "all",
  theme: "all",
  diet: "all",
};

// Themes we know about from /src/data/presets. Kept small-and-curated
// here so the chip row doesn't overflow — long-tail themes can get a
// "More themes" expand later.
const FEATURED_THEMES: Array<{ slug: string; name: string; emoji: string }> = [
  { slug: "thanksgiving-potluck", name: "Thanksgiving", emoji: "🦃" },
  { slug: "friendsgiving-potluck", name: "Friendsgiving", emoji: "🍽" },
  { slug: "memorial-day-cookout-potluck", name: "Cookout", emoji: "🇺🇸" },
  { slug: "cinco-de-mayo-potluck", name: "Cinco de Mayo", emoji: "🌮" },
  { slug: "italian-night", name: "Italian Night", emoji: "🍝" },
  { slug: "easter-potluck", name: "Easter", emoji: "🐣" },
];

function filterDishes(
  dishes: GalleryDish[],
  f: GalleryFilterState,
): GalleryDish[] {
  const q = f.search.trim().toLowerCase();

  return dishes.filter((d) => {
    if (f.course !== "all" && d.course !== f.course) return false;
    if (f.season !== "all" && !d.seasons.includes(f.season)) return false;
    if (f.theme !== "all" && !d.themeSlugs.includes(f.theme)) return false;
    if (f.diet !== "all" && !d.tags.includes(f.diet)) return false;

    if (q) {
      const hay = [
        d.name,
        d.tagline,
        d.note ?? "",
        ...d.photos.map((p) => `${p.bringer} ${p.potluckName}`),
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function GalleryIndex() {
  const [filters, setFilters] = useState<GalleryFilterState>(INITIAL_FILTERS);
  // Loading is simulated: in production this is where SWR / Firestore
  // subscription state lives. Keeping the shape makes the skeleton state
  // real rather than theoretical.
  const [loading] = useState(false);
  const prefersReduced = useReducedMotion();

  const heroPhotos = useMemo(() => getHeroCollagePhotos(), []);
  const filtered = useMemo(() => filterDishes(galleryDishes, filters), [filters]);

  const totalDishes = galleryDishes.length;
  const totalPhotos = galleryDishes.reduce((n, d) => n + d.photos.length, 0);
  const totalBringers = new Set(
    galleryDishes.flatMap((d) => d.photos.map((p) => p.bringer)),
  ).size;

  const hasFilters =
    filters.search !== "" ||
    filters.course !== "all" ||
    filters.season !== "all" ||
    filters.theme !== "all" ||
    filters.diet !== "all";

  const resetFilters = () => setFilters(INITIAL_FILTERS);

  return (
    <main className="gallery-page">
      <section className="gallery-hero" aria-labelledby="gallery-hero-title">
        <div>
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="gallery-hero-eyebrow">The Potlucky Archive</div>
            <h1 id="gallery-hero-title" className="gallery-hero-title">
              Every dish, <em>every potluck.</em>
            </h1>
            <p className="gallery-hero-lede">
              A living cookbook of what real friends have brought to real
              tables. Photos, themes, and the people behind the dish —
              scribbled down so the next potluck doesn&apos;t start from a
              blank page.
            </p>
            <div className="gallery-hero-meta">
              <div>
                <span className="gallery-hero-meta-num">{totalDishes}</span>
                dishes in the archive
              </div>
              <div>
                <span className="gallery-hero-meta-num">{totalPhotos}</span>
                photos, hand-uploaded
              </div>
              <div>
                <span className="gallery-hero-meta-num">{totalBringers}</span>
                friends, bringing food
              </div>
            </div>
          </motion.div>
        </div>
        <GalleryHeroCollage photos={heroPhotos} />
      </section>

      <GalleryFilters
        state={filters}
        onChange={setFilters}
        availableThemes={FEATURED_THEMES}
      />

      <div className="gallery-result-bar" aria-live="polite">
        <span className="gallery-result-count">
          {loading ? (
            "Setting the table…"
          ) : filtered.length === 0 ? (
            "Nothing here yet"
          ) : (
            <>
              <strong>{filtered.length}</strong>
              {filtered.length === 1 ? " dish" : " dishes"}
              {hasFilters ? " matching" : " in the archive"}
            </>
          )}
        </span>
        {hasFilters && (
          <button
            type="button"
            className="gallery-empty-btn"
            onClick={resetFilters}
          >
            Clear filters ↺
          </button>
        )}
      </div>

      {loading ? (
        <div className="dish-grid" aria-busy="true">
          {Array.from({ length: 8 }).map((_, i) => (
            <DishCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="dish-grid">
          {filtered.map((dish, i) => (
            <DishCard key={dish.slug} dish={dish} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState onReset={resetFilters} />
      )}

      <section
        style={{
          maxWidth: "36rem",
          margin: "0 auto",
          padding: "24px 20px 96px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontStyle: "italic",
            fontSize: "0.95rem",
            color: "var(--color-text-muted)",
            marginBottom: 12,
          }}
        >
          Hosting soon? The archive grows with you.
        </p>
        <Link href="/" className="btn btn-outline">
          Start a potluck →
        </Link>
      </section>
    </main>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="gallery-empty" role="status">
      <span className="gallery-empty-emoji" aria-hidden="true">
        🥣
      </span>
      <h3 className="gallery-empty-title">
        No dishes matching that combination <em>yet</em>.
      </h3>
      <p className="gallery-empty-body">
        The archive grows every weekend — check back after the next potluck,
        or loosen a filter to see what&apos;s already here.
      </p>
      <button type="button" onClick={onReset} className="gallery-empty-btn">
        Show all dishes →
      </button>
    </div>
  );
}
