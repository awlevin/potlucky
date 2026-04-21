import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPresetBySlug,
  getMarketablePresets,
  PotluckPreset,
  PresetDish,
} from "@/data/presets";
import { SITE_URL } from "@/lib/site";
import HowItWorks from "@/components/HowItWorks";
import { StartPotluckCTA } from "@/components/StartPotluckCTA";
import {
  DishPhotoStrip,
  DishPhotoBadge,
} from "@/components/gallery/DishPhotoStrip";
import {
  fuzzyMatchDishName,
  galleryDishes,
} from "@/data/dishGallery";

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return getMarketablePresets().map((p) => ({ slug: p.marketing!.slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const preset = getPresetBySlug(params.slug);
  if (!preset || !preset.marketing) return {};

  const { metaTitle, metaDescription, keywords, slug } = preset.marketing;
  const url = `${SITE_URL}/ideas/${slug}`;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url,
      type: "website",
      siteName: "Potlucky",
      images: [
        {
          url: `${url}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: preset.marketing.headline,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
      images: [`${url}/opengraph-image`],
    },
  };
}

type Course = "appetizer" | "main" | "side" | "dessert" | "drink";

const COURSE_ORDER: Course[] = ["appetizer", "main", "side", "dessert", "drink"];

const COURSE_LABEL: Record<Course, string> = {
  appetizer: "Appetizers",
  main: "Mains",
  side: "Sides",
  dessert: "Desserts",
  drink: "Drinks",
};

const COURSE_EMOJI: Record<Course, string> = {
  appetizer: "🥟",
  main: "🍽️",
  side: "🥗",
  dessert: "🍰",
  drink: "🥤",
};

function groupByCourse(dishes: PresetDish[]) {
  const groups = new Map<Course, PresetDish[]>();
  for (const d of dishes) {
    const t = (d.type ?? "main") as Course;
    if (!groups.has(t)) groups.set(t, []);
    groups.get(t)!.push(d);
  }
  return COURSE_ORDER.filter((t) => groups.has(t)).map((t) => ({
    type: t,
    label: COURSE_LABEL[t],
    emoji: COURSE_EMOJI[t],
    dishes: groups.get(t)!,
  }));
}

function buildJsonLd(preset: PotluckPreset) {
  const url = `${SITE_URL}/ideas/${preset.marketing!.slug}`;
  const nodes: Record<string, unknown>[] = [
    {
      "@type": "WebPage",
      "@id": url,
      url,
      name: preset.marketing!.metaTitle,
      description: preset.marketing!.metaDescription,
      isPartOf: { "@id": `${SITE_URL}#website` },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}#website`,
      url: SITE_URL,
      name: "Potlucky",
    },
    {
      "@type": "ItemList",
      name: `${preset.name} dish ideas`,
      numberOfItems: preset.dishes.length,
      itemListElement: preset.dishes.map((d, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: d.title,
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Ideas", item: `${SITE_URL}/ideas` },
        { "@type": "ListItem", position: 3, name: preset.name, item: url },
      ],
    },
  ];

  if (preset.date) {
    nodes.push({
      "@type": "Event",
      name: preset.name,
      startDate: new Date(preset.date).toISOString(),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      description: preset.marketing!.subheadline,
      location: {
        "@type": "VirtualLocation",
        url,
      },
      organizer: {
        "@type": "Organization",
        name: "Potlucky",
        url: SITE_URL,
      },
    });
  }

  return { "@context": "https://schema.org", "@graph": nodes };
}

export default function IdeaLandingPage({ params }: PageProps) {
  const preset = getPresetBySlug(params.slug);
  if (!preset || !preset.marketing) notFound();

  const groups = groupByCourse(preset.dishes);
  const jsonLd = buildJsonLd(preset);

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="hero">
        <div style={{ maxWidth: "48rem", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "4rem", marginBottom: "16px" }}>{preset.emoji}</div>
          <h1 className="hero-heading" style={{ marginBottom: "20px" }}>
            {preset.marketing.headline}
          </h1>
          <p
            style={{
              fontSize: "1.125rem",
              color: "var(--color-text-secondary)",
              maxWidth: "36rem",
              margin: "0 auto 28px",
              lineHeight: 1.5,
            }}
          >
            {preset.marketing.subheadline}
          </p>
          <StartPotluckCTA preset={preset} label={`Start this potluck — ${preset.dishes.length} dishes ready`} />
          {preset.date && (
            <p
              style={{
                marginTop: "16px",
                fontSize: "0.875rem",
                color: "var(--color-text-muted)",
              }}
            >
              📅 {preset.date}
            </p>
          )}
        </div>
      </section>

      <section style={{ padding: "56px 16px" }}>
        <div style={{ maxWidth: "48rem", margin: "0 auto" }}>
          <h2
            className="display-heading"
            style={{ fontSize: "1.75rem", textAlign: "center", marginBottom: "8px" }}
          >
            The menu
          </h2>
          <p
            style={{
              textAlign: "center",
              fontSize: "0.875rem",
              color: "var(--color-text-muted)",
              marginBottom: "32px",
            }}
          >
            {preset.dishes.length} hand-picked dishes, already grouped by course.
          </p>

          <div className="menu-list">
            {groups.map((group) => (
              <div key={group.type} className="menu-group">
                <div className="menu-group-header">
                  <span className="menu-group-emoji">{group.emoji}</span>
                  <span className="menu-group-label">{group.label}</span>
                  <span className="menu-group-count">{group.dishes.length}</span>
                </div>
                {group.dishes.map((d, i) => {
                  // Try to match this preset dish to a real gallery dish
                  // for this theme. If we find one, inline its photos.
                  const match = galleryDishes.find(
                    (gd) =>
                      gd.themeSlugs.includes(preset.marketing!.slug) &&
                      fuzzyMatchDishName(gd.name, d.title),
                  );
                  const photos = match?.photos ?? [];
                  const hasPhotos = photos.length > 0;

                  return (
                    <div
                      key={`${group.type}-${i}`}
                      className={`menu-row menu-row-unclaimed ${hasPhotos ? "menu-row-with-photos" : ""}`}
                    >
                      <div className="menu-dish-info">
                        <div className="menu-dish-name">
                          {match ? (
                            <Link
                              href={`/gallery/${match.slug}`}
                              style={{
                                color: "inherit",
                                textDecoration: "none",
                                borderBottom: "1px dotted var(--color-text-muted)",
                                paddingBottom: "1px",
                              }}
                            >
                              {d.title}
                            </Link>
                          ) : (
                            d.title
                          )}
                          {hasPhotos && <DishPhotoBadge count={photos.length} />}
                        </div>
                        {d.attributes && d.attributes.length > 0 && (
                          <div className="menu-dish-note">
                            {d.attributes.join(" · ")}
                          </div>
                        )}
                      </div>
                      {hasPhotos && (
                        <DishPhotoStrip dish={match} photos={photos} />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: "32px" }}>
            <StartPotluckCTA preset={preset} label="Start this potluck" />
          </div>
        </div>
      </section>

      <HowItWorks />

      <section style={{ padding: "16px 16px 64px" }}>
        <div style={{ maxWidth: "56rem", margin: "0 auto", textAlign: "center" }}>
          <Link
            href="/ideas"
            style={{
              fontSize: "0.875rem",
              color: "var(--color-text-muted)",
              textDecoration: "underline",
              textUnderlineOffset: "2px",
            }}
          >
            ← Browse all potluck ideas
          </Link>
        </div>
      </section>
    </main>
  );
}
