"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { GalleryDish } from "@/data/dishGallery";
import { COURSE_EMOJI, COURSE_LABEL } from "@/data/dishGallery";

interface DishDetailProps {
  dish: GalleryDish;
  themeLookup: Record<string, { name: string; emoji: string }>;
}

function formatMonthYear(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}
function formatLongDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function DishDetail({ dish, themeLookup }: DishDetailProps) {
  const [appearancesOpen, setAppearancesOpen] = useState(true);
  const [themesOpen, setThemesOpen] = useState(false);
  const [dedupeOpen, setDedupeOpen] = useState(false);
  const [attribOpen, setAttribOpen] = useState(false);
  const prefersReduced = useReducedMotion();

  const hero = dish.photos[0];
  const secondaryPhotos = dish.photos.slice(1, 3);
  const courseEmoji = COURSE_EMOJI[dish.course];
  const courseLabel = COURSE_LABEL[dish.course];

  return (
    <main className="dish-detail">
      <nav className="dish-crumb" aria-label="Breadcrumb">
        <Link href="/gallery">The Archive</Link>
        <span className="dish-crumb-sep">/</span>
        <Link href={`/gallery?course=${dish.course}`}>
          {courseEmoji} {courseLabel}
        </Link>
        <span className="dish-crumb-sep">/</span>
        <span className="dish-crumb-current">{dish.name}</span>
      </nav>

      <header className="dish-header">
        <div style={{ minWidth: 0 }}>
          <motion.h1
            className="dish-title"
            initial={prefersReduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {dish.name}
          </motion.h1>
          <p className="dish-tagline">{dish.tagline}</p>
          {dish.tags.length > 0 && (
            <div className="dish-tag-row">
              {dish.tags.map((t) => (
                <span key={t} className="dish-tag">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="dish-stats" aria-label="Dish stats">
          <div>
            <div className="dish-stat-num">{dish.appearances}</div>
            <div className="dish-stat-label">Potlucks</div>
          </div>
          <div>
            <div className="dish-stat-num">{dish.photos.length}</div>
            <div className="dish-stat-label">Photos</div>
          </div>
          <div>
            <div className="dish-stat-num">{dish.saves}</div>
            <div className="dish-stat-label">Saves</div>
          </div>
        </div>
      </header>

      {/* Hero photo stack — big primary + two secondary tiles on md+ */}
      {hero ? (
        <div
          className={`dish-hero-stack ${secondaryPhotos.length === 0 ? "dish-hero-tile-only-main" : ""}`}
        >
          <Link
            href={`/potlucks/${hero.potluckSlug}`}
            className="dish-hero-tile dish-hero-stack-main"
            aria-label={`${hero.bringer} at ${hero.potluckName}`}
          >
            <Image
              src={hero.src}
              alt={hero.alt}
              fill
              sizes="(max-width: 640px) 100vw, 640px"
              style={{ objectFit: "cover" }}
              unoptimized
              priority
            />
            <div className="dish-hero-tile-caption">
              {hero.caption ?? `${hero.bringer}, ${formatMonthYear(hero.date)}`}
              <span className="byline">
                {hero.potluckName}
              </span>
            </div>
          </Link>
          {secondaryPhotos.map((p) => (
            <Link
              key={p.id}
              href={`/potlucks/${p.potluckSlug}`}
              className="dish-hero-tile"
              aria-label={`${p.bringer} at ${p.potluckName}`}
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes="(max-width: 640px) 100vw, 320px"
                style={{ objectFit: "cover" }}
                unoptimized
              />
              <div className="dish-hero-tile-caption">
                {p.bringer}
                <span className="byline">{formatMonthYear(p.date)}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <DishDetailEmptyHero dish={dish} />
      )}

      {/* Note / attribution — shown above-the-fold if we have it */}
      {dish.note && (
        <aside className="dish-note">
          {dish.note}
          {dish.originalBringer && (
            <span className="dish-note-byline">
              — first brought by {dish.originalBringer}
              {dish.originalPotluckName && `, ${dish.originalPotluckName}`}
            </span>
          )}
        </aside>
      )}

      {/* Add-to-potluck CTA */}
      <div className="dish-cta-card">
        <p className="dish-cta-text">
          Hosting soon? Add {dish.name} to your next potluck so someone knows
          to bring it.
        </p>
        <Link href={`/?add=${dish.slug}`} className="btn btn-lg">
          + Add to my potluck
        </Link>
      </div>

      {/* Photo wall — every instance */}
      {dish.photos.length > 1 && (
        <>
          <div className="dish-photo-wall-label">
            <h2>Every time it&apos;s been brought</h2>
            <div className="dish-photo-wall-label-rule" aria-hidden="true" />
            <span className="dish-photo-wall-label-count">
              {dish.photos.length}
            </span>
          </div>
          <div className="dish-photo-wall">
            {dish.photos.map((p) => (
              <Link
                key={p.id}
                href={`/potlucks/${p.potluckSlug}`}
                className="dish-photo-wall-item"
                aria-label={`${p.bringer} at ${p.potluckName}`}
              >
                <Image
                  src={p.src}
                  alt={p.alt}
                  width={400}
                  height={500}
                  unoptimized
                  style={{ objectFit: "cover", width: "100%", height: "100%" }}
                />
                <span className="dish-photo-wall-item-byline">
                  {p.bringer.split(" ")[0]}, {formatMonthYear(p.date)}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* --------- Progressive disclosure panels --------- */}

      <CollapseSection
        title={<>Where it&rsquo;s been</>}
        count={dish.history.length}
        open={appearancesOpen}
        onToggle={() => setAppearancesOpen((v) => !v)}
        reducedMotion={!!prefersReduced}
      >
        <ol className="dish-timeline">
          {dish.history.map((h) => (
            <li key={h.potluckSlug + h.date} className="dish-timeline-item">
              <span className="dish-timeline-date">{formatLongDate(h.date)}</span>
              <Link href={`/potlucks/${h.potluckSlug}`} className="dish-timeline-link">
                {h.potluckName}
              </Link>
              <div className="dish-timeline-meta">
                {h.themeName && (
                  <>
                    A <Link href={`/ideas/${h.themeSlug}`} style={{ color: "inherit", borderBottom: "1px dotted currentColor" }}>{h.themeName}</Link>{" "}
                    potluck ·{" "}
                  </>
                )}
                brought by <span className="dish-timeline-bringer">{h.bringer}</span>
              </div>
            </li>
          ))}
        </ol>
      </CollapseSection>

      {dish.themeSlugs.length > 0 && (
        <CollapseSection
          title="Themes it belongs to"
          count={dish.themeSlugs.length}
          open={themesOpen}
          onToggle={() => setThemesOpen((v) => !v)}
          reducedMotion={!!prefersReduced}
        >
          <div className="dish-theme-links">
            {dish.themeSlugs.map((slug) => {
              const t = themeLookup[slug];
              const appearancesHere = dish.history.filter(
                (h) => h.themeSlug === slug,
              ).length;
              return (
                <Link
                  key={slug}
                  href={`/ideas/${slug}`}
                  className="dish-theme-link"
                >
                  {t?.emoji && (
                    <span className="dish-theme-link-emoji" aria-hidden="true">
                      {t.emoji}
                    </span>
                  )}
                  <span>{t?.name ?? slug}</span>
                  {appearancesHere > 0 && (
                    <span className="dish-theme-link-count">
                      · {appearancesHere}×
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </CollapseSection>
      )}

      {dish.dedupeCandidates && dish.dedupeCandidates.length > 0 && (
        <CollapseSection
          title="Similar dishes we noticed"
          count={dish.dedupeCandidates.length}
          open={dedupeOpen}
          onToggle={() => setDedupeOpen((v) => !v)}
          reducedMotion={!!prefersReduced}
          hint="Merged dishes share a page so attribution isn't split."
        >
          <ul className="dish-dedupe-list">
            {dish.dedupeCandidates.map((c) => (
              <li key={c.slug} className="dish-dedupe-item">
                <span className="dish-dedupe-sim">{Math.round(c.similarity * 100)}%</span>
                <Link href={`/gallery/${c.slug}`} className="dish-dedupe-name">
                  {c.name}
                </Link>
                <button
                  type="button"
                  className="btn btn-outline btn-xs dish-dedupe-action"
                >
                  Suggest merge
                </button>
              </li>
            ))}
          </ul>
        </CollapseSection>
      )}

      {(dish.originalBringer || dish.originalPotluckName) && (
        <CollapseSection
          title="Provenance"
          open={attribOpen}
          onToggle={() => setAttribOpen((v) => !v)}
          reducedMotion={!!prefersReduced}
        >
          <p
            style={{
              fontFamily: "var(--font-fraunces), Georgia, serif",
              fontStyle: "italic",
              fontSize: "0.95rem",
              color: "var(--color-text-secondary)",
              margin: 0,
              lineHeight: 1.55,
            }}
          >
            First brought to Potlucky by{" "}
            <strong style={{ fontStyle: "normal", color: "var(--color-text)" }}>
              {dish.originalBringer}
            </strong>
            {dish.originalPotluckName ? (
              <>
                {" "}at <em>{dish.originalPotluckName}</em>
              </>
            ) : null}
            .
          </p>
        </CollapseSection>
      )}
    </main>
  );
}

// --- Helpers -----------------------------------------------------------------

interface CollapseSectionProps {
  title: React.ReactNode;
  count?: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  hint?: string;
  reducedMotion: boolean;
}

function CollapseSection({
  title,
  count,
  open,
  onToggle,
  children,
  hint,
  reducedMotion,
}: CollapseSectionProps) {
  return (
    <section className="dish-section">
      <button
        type="button"
        className="dish-section-header"
        aria-expanded={open}
        onClick={onToggle}
      >
        <span className="dish-section-title">
          <span>{title}</span>
          {typeof count === "number" && (
            <span className="dish-section-title-count">{count}</span>
          )}
        </span>
        <span className="dish-section-toggle">
          {open ? "Hide" : "Show"}
          <span className="dish-section-toggle-icon" aria-hidden="true">
            ˅
          </span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className="dish-section-body"
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          >
            {hint && (
              <p
                style={{
                  fontSize: 12,
                  color: "var(--color-text-muted)",
                  fontStyle: "italic",
                  marginTop: 0,
                  marginBottom: 10,
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                }}
              >
                {hint}
              </p>
            )}
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function DishDetailEmptyHero({ dish }: { dish: GalleryDish }) {
  return (
    <div
      className="dish-card-empty"
      style={{
        aspectRatio: "16 / 7",
        marginBottom: 28,
        borderRadius: "var(--radius-lg)",
        flexDirection: "column",
        gap: 10,
        fontSize: "1rem",
      }}
    >
      <span style={{ fontSize: "3rem" }}>🥣</span>
      <span
        style={{
          fontFamily: "var(--font-fraunces), Georgia, serif",
          fontStyle: "italic",
          fontSize: "1rem",
          color: "var(--color-text-muted)",
          maxWidth: 360,
          textAlign: "center",
          padding: "0 16px",
          lineHeight: 1.45,
        }}
      >
        No photos of {dish.name} yet. Be the first — bring it to a potluck
        and upload a snap.
      </span>
    </div>
  );
}
