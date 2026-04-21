"use client";

import { useMemo } from "react";
import type { Course, Season } from "@/data/dishGallery";
import { COURSE_EMOJI, COURSE_LABEL, SEASON_LABEL } from "@/data/dishGallery";

export interface GalleryFilterState {
  search: string;
  course: Course | "all";
  season: Season | "all";
  theme: string | "all";
  diet: string | "all";
}

interface GalleryFiltersProps {
  state: GalleryFilterState;
  onChange: (next: GalleryFilterState) => void;
  availableThemes: Array<{ slug: string; name: string; emoji: string }>;
}

/**
 * Sticky toolbar with a search input and four horizontal chip scrollers
 * (course, season, theme, diet). Every chip is a proper button, keyboard-
 * focusable; the active chip is high-contrast.
 */
export function GalleryFilters({ state, onChange, availableThemes }: GalleryFiltersProps) {
  const setField = <K extends keyof GalleryFilterState>(
    key: K,
    value: GalleryFilterState[K],
  ) => onChange({ ...state, [key]: value });

  const courseChips = useMemo(
    () =>
      (["all", "appetizer", "main", "side", "dessert", "drink"] as const).map((c) => ({
        value: c,
        label: c === "all" ? "All courses" : COURSE_LABEL[c as Course],
        emoji: c === "all" ? "🍽" : COURSE_EMOJI[c as Course],
      })),
    [],
  );

  const seasonChips = useMemo(
    () =>
      (["all", "spring", "summer", "fall", "winter"] as const).map((s) => ({
        value: s,
        label: s === "all" ? "All seasons" : SEASON_LABEL[s as Season],
        emoji:
          s === "spring" ? "🌷" : s === "summer" ? "☀️" : s === "fall" ? "🍂" : s === "winter" ? "❄️" : "📅",
      })),
    [],
  );

  const dietChips = useMemo(
    () => [
      { value: "all", label: "Any diet", emoji: "—" },
      { value: "vegetarian", label: "Vegetarian", emoji: "🥕" },
      { value: "vegan", label: "Vegan", emoji: "🌱" },
      { value: "gluten-free", label: "Gluten-free", emoji: "🌾" },
      { value: "dairy-free", label: "Dairy-free", emoji: "🥛" },
      { value: "nut-free", label: "Nut-free", emoji: "🥜" },
    ],
    [],
  );

  return (
    <div className="gallery-toolbar" role="search" aria-label="Filter dish gallery">
      <div className="gallery-toolbar-inner">
        <div className="gallery-search">
          <span className="gallery-search-icon" aria-hidden="true">
            ⌕
          </span>
          <input
            type="search"
            placeholder="Search dishes, bringers, or potlucks…"
            value={state.search}
            onChange={(e) => setField("search", e.target.value)}
            aria-label="Search dishes, bringers, or potlucks"
          />
        </div>

        <div
          className="gallery-chips"
          role="radiogroup"
          aria-label="Filter by course"
        >
          {courseChips.map((c) => (
            <button
              key={c.value}
              type="button"
              role="radio"
              aria-checked={state.course === c.value}
              onClick={() => setField("course", c.value as Course | "all")}
              className={`gallery-chip ${state.course === c.value ? "gallery-chip-active" : ""}`}
            >
              <span className="gallery-chip-emoji" aria-hidden="true">
                {c.emoji}
              </span>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="gallery-toolbar-inner"
        style={{ marginTop: 8, gap: 8 }}
      >
        <div
          className="gallery-chips"
          role="radiogroup"
          aria-label="Filter by theme"
        >
          <button
            type="button"
            role="radio"
            aria-checked={state.theme === "all"}
            onClick={() => setField("theme", "all")}
            className={`gallery-chip ${state.theme === "all" ? "gallery-chip-active" : ""}`}
          >
            All themes
          </button>
          {availableThemes.map((t) => (
            <button
              key={t.slug}
              type="button"
              role="radio"
              aria-checked={state.theme === t.slug}
              onClick={() => setField("theme", t.slug)}
              className={`gallery-chip ${state.theme === t.slug ? "gallery-chip-active" : ""}`}
            >
              <span className="gallery-chip-emoji" aria-hidden="true">
                {t.emoji}
              </span>
              {t.name}
            </button>
          ))}
        </div>

        <div
          className="gallery-chips"
          role="radiogroup"
          aria-label="Filter by season"
        >
          {seasonChips.map((s) => (
            <button
              key={s.value}
              type="button"
              role="radio"
              aria-checked={state.season === s.value}
              onClick={() => setField("season", s.value as Season | "all")}
              className={`gallery-chip ${state.season === s.value ? "gallery-chip-active" : ""}`}
            >
              <span className="gallery-chip-emoji" aria-hidden="true">
                {s.emoji}
              </span>
              {s.label}
            </button>
          ))}
        </div>

        <div
          className="gallery-chips"
          role="radiogroup"
          aria-label="Filter by diet"
        >
          {dietChips.map((d) => (
            <button
              key={d.value}
              type="button"
              role="radio"
              aria-checked={state.diet === d.value}
              onClick={() => setField("diet", d.value)}
              className={`gallery-chip ${state.diet === d.value ? "gallery-chip-active" : ""}`}
            >
              {d.emoji !== "—" && (
                <span className="gallery-chip-emoji" aria-hidden="true">
                  {d.emoji}
                </span>
              )}
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
