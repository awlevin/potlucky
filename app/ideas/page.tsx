import type { Metadata } from "next";
import Link from "next/link";
import {
  getMarketablePresets,
  getPresetsByCategory,
  getUpcomingPresets,
  presetDietarySummary,
  type PotluckPreset,
  type PresetCategory,
} from "@/data/presets";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Potluck Ideas & Themes — Free Sign-Up Sheet Templates | Potlucky",
  description:
    "Browse 45+ curated potluck themes — holidays, seasonal menus, diet-friendly (keto, vegan, GF, dairy-free), game day, cuisines, life moments, cozy nights. Free sign-up sheets, no accounts needed.",
  alternates: { canonical: `${SITE_URL}/ideas` },
  openGraph: {
    title: "Potluck Ideas & Themes — Free Sign-Up Sheet Templates",
    description:
      "Curated potluck themes for every holiday, season, diet, and occasion. Share a link, claim dishes, feast together.",
    url: `${SITE_URL}/ideas`,
    type: "website",
    siteName: "Potlucky",
  },
  twitter: {
    card: "summary_large_image",
    title: "Potluck Ideas & Themes — Free Sign-Up Sheet Templates",
    description:
      "45+ curated potluck themes. Share a link, claim dishes, feast together.",
  },
};

/* ---------- Section config ---------- */

type SectionDef = {
  id: PresetCategory;
  numeral: string;
  title: string;
  kicker: string;
  blurb: string;
  tint: string; // --section-tint CSS value
};

const SECTIONS: SectionDef[] = [
  {
    id: "holiday",
    numeral: "01",
    title: "Holidays & Milestones",
    kicker: "When the calendar says something's happening.",
    blurb:
      "Curated menus for every major holiday — calendar dates locked in, ready to share.",
    tint: "var(--color-brand-light)",
  },
  {
    id: "seasonal",
    numeral: "02",
    title: "Seasonal",
    kicker: "Cook what's at the farmers' market this week.",
    blurb:
      "Menus built around peak produce — asparagus in April, stone fruit in August, squash by November.",
    tint: "var(--color-accent-light)",
  },
  {
    id: "dietary",
    numeral: "03",
    title: "Diet-Friendly",
    kicker: "Nobody's leaving hungry — or guessing.",
    blurb:
      "Every dish thought through for the diet at hand. Keto, vegetarian, vegan, gluten-free, dairy-free, Whole30, paleo, pescatarian, nut-free for the kids.",
    tint: "#ECF5EC",
  },
  {
    id: "sports",
    numeral: "04",
    title: "Game Day & Sports",
    kicker: "One-handed food. Eyes on the screen.",
    blurb:
      "Super Bowl, World Cup, March Madness, F1, tailgates, fantasy drafts — menus for when the ball is in play.",
    tint: "#FEF0ED",
  },
  {
    id: "cuisine",
    numeral: "05",
    title: "Cuisines of the World",
    kicker: "Pick a country. Cook its hits.",
    blurb:
      "Taco bars, ramen nights, Korean BBQ, French bistro, Southern comfort, Mediterranean mezze, and more.",
    tint: "var(--color-muted)",
  },
  {
    id: "life",
    numeral: "06",
    title: "Life Moments",
    kicker: "When something worth marking happens.",
    blurb:
      "Housewarmings, baby showers, bridal showers, grad parties, freezer-meal drop-offs for new parents, going-away dinners.",
    tint: "var(--color-brand-light)",
  },
  {
    id: "cozy",
    numeral: "07",
    title: "Cozy & Casual",
    kicker: "No reason needed. Just dinner with friends.",
    blurb:
      "Fondue, charcuterie, pizza night, soup swap, breakfast-for-dinner, game night — low-effort, high-comfort.",
    tint: "#FFF7E8",
  },
];

/* ---------- Card helpers ---------- */

function dietaryChips(preset: PotluckPreset): string[] {
  const total = preset.dishes.length;
  const s = presetDietarySummary(preset);
  const chips: string[] = [];
  if (s.vegan === total) chips.push("all vegan");
  else if (s.vegan >= Math.ceil(total / 2)) chips.push(`${s.vegan} vegan`);
  else if (s.vegan > 0) chips.push(`${s.vegan} vegan`);

  if (s.vegetarian === total) {
    // don't double-count if we already said "all vegan"
    if (!chips.some((c) => c.includes("all vegan")))
      chips.push("all vegetarian");
  } else if (s.vegetarian > s.vegan && s.vegetarian > 0) {
    chips.push(`${s.vegetarian} vegetarian`);
  }

  if (s.glutenFree === total) chips.push("all GF");
  else if (s.glutenFree >= Math.ceil(total / 2))
    chips.push(`${s.glutenFree} GF`);

  if (s.dairyFree === total) chips.push("all dairy-free");
  else if (s.dairyFree >= Math.ceil(total / 2))
    chips.push(`${s.dairyFree} dairy-free`);

  return chips.slice(0, 2);
}

function IdeaCard({ preset }: { preset: PotluckPreset }) {
  const chips = dietaryChips(preset);
  return (
    <Link
      href={`/ideas/${preset.marketing!.slug}`}
      className={`idea-card ${preset.featured ? "idea-card-featured" : ""}`}
      style={{ textDecoration: "none" }}
    >
      <span className="idea-card-emoji">{preset.emoji}</span>
      <span className="idea-card-name">{preset.name}</span>
      {preset.tagline && (
        <span className="idea-card-tagline">{preset.tagline}</span>
      )}
      <span className="idea-card-meta">
        <span>{preset.dishes.length} dishes</span>
        {preset.date && (
          <span className="idea-card-meta-date">{preset.date}</span>
        )}
      </span>
      {chips.length > 0 && (
        <span className="idea-card-chips">
          {chips.map((c) => (
            <span key={c} className="idea-card-chip">
              {c}
            </span>
          ))}
        </span>
      )}
      <span className="idea-card-arrow">→</span>
    </Link>
  );
}

/* ---------- Page ---------- */

export default function IdeasHubPage() {
  const marketable = getMarketablePresets();
  const upcoming = getUpcomingPresets().filter((p) => p.marketing).slice(0, 4);

  const sectionsWithPresets = SECTIONS.map((s) => ({
    ...s,
    presets: getPresetsByCategory(s.id),
  })).filter((s) => s.presets.length > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/ideas`,
        url: `${SITE_URL}/ideas`,
        name: "Potluck Ideas & Themes — Free Sign-Up Sheet Templates | Potlucky",
        isPartOf: { "@id": `${SITE_URL}#website` },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}#website`,
        url: SITE_URL,
        name: "Potlucky",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Ideas",
            item: `${SITE_URL}/ideas`,
          },
        ],
      },
      {
        "@type": "ItemList",
        name: "Potluck ideas",
        numberOfItems: marketable.length,
        itemListElement: marketable.map((preset, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: preset.name,
          url: `${SITE_URL}/ideas/${preset.marketing!.slug}`,
        })),
      },
    ],
  };

  return (
    <main className="ideas-v2">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="ideas-v2-hero">
        <div className="ideas-v2-hero-inner">
          <div className="ideas-v2-hero-label">The Potluck Index</div>
          <h1 className="ideas-v2-hero-heading">
            <span className="ideas-v2-dropcap">P</span>otluck Ideas
            <br />
            <em className="ideas-v2-hero-em">for Every Occasion</em>
          </h1>
          <p className="ideas-v2-hero-sub">
            {marketable.length} curated menus — holidays, seasons, every diet,
            game day, cuisines, life moments. Free sign-up sheets. No accounts,
            no spreadsheets, no fuss.
          </p>
          <div className="ideas-v2-hero-stats">
            <span>
              <strong>{marketable.length}</strong> themes
            </span>
            <span className="ideas-v2-hero-dot">·</span>
            <span>
              <strong>{SECTIONS.length}</strong> categories
            </span>
            <span className="ideas-v2-hero-dot">·</span>
            <span>
              <strong>dietary tags</strong> on every dish
            </span>
          </div>
        </div>
      </section>

      {/* Sticky pill nav */}
      <nav className="ideas-v2-nav" aria-label="Jump to section">
        <div className="ideas-v2-nav-inner">
          {upcoming.length > 0 && (
            <a href="#happening-soon" className="ideas-v2-nav-pill">
              ✨ Happening soon
            </a>
          )}
          {sectionsWithPresets.map((s) => (
            <a
              key={s.id}
              href={`#section-${s.id}`}
              className="ideas-v2-nav-pill"
            >
              {s.title}
            </a>
          ))}
        </div>
      </nav>

      {/* Happening Soon */}
      {upcoming.length > 0 && (
        <section
          id="happening-soon"
          className="ideas-v2-section ideas-v2-section-upcoming"
          style={{ ["--section-tint" as string]: "var(--color-brand-light)" }}
        >
          <div className="ideas-v2-section-inner">
            <div className="ideas-v2-section-header">
              <div className="ideas-v2-section-numeral">✦</div>
              <div className="ideas-v2-section-heading-wrap">
                <div className="ideas-v2-section-kicker">
                  Happening in the next few weeks
                </div>
                <h2 className="ideas-v2-section-title">Happening Soon</h2>
                <p className="ideas-v2-section-blurb">
                  Calendar-relevant picks for right now — grab one before the
                  date passes.
                </p>
              </div>
            </div>
            <div className="ideas-v2-card-grid ideas-v2-card-grid-featured">
              {upcoming.map((p) => (
                <IdeaCard key={p.id} preset={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category sections */}
      {sectionsWithPresets.map((s) => (
        <section
          key={s.id}
          id={`section-${s.id}`}
          className="ideas-v2-section"
          style={{ ["--section-tint" as string]: s.tint }}
        >
          <div className="ideas-v2-section-inner">
            <div className="ideas-v2-section-header">
              <div className="ideas-v2-section-numeral">{s.numeral}</div>
              <div className="ideas-v2-section-heading-wrap">
                <div className="ideas-v2-section-kicker">{s.kicker}</div>
                <h2 className="ideas-v2-section-title">{s.title}</h2>
                <p className="ideas-v2-section-blurb">{s.blurb}</p>
              </div>
            </div>
            <div className="ideas-v2-card-grid">
              {s.presets.map((p) => (
                <IdeaCard key={p.id} preset={p} />
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="ideas-v2-outro">
        <div className="ideas-v2-outro-inner">
          <p className="ideas-v2-outro-text">
            Don&apos;t see your thing?{" "}
            <Link href="/" className="ideas-v2-outro-link">
              Start a blank potluck
            </Link>{" "}
            and add your own dishes.
          </p>
        </div>
      </section>
    </main>
  );
}
