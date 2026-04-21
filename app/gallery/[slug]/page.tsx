import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DishDetail } from "@/components/gallery/DishDetail";
import { galleryDishes, getDishBySlug } from "@/data/dishGallery";
import { presets } from "@/data/presets";
import { SITE_URL } from "@/lib/site";

interface PageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return galleryDishes.map(({ slug }) => ({ slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const dish = getDishBySlug(params.slug);
  if (!dish) return {};

  const url = `${SITE_URL}/gallery/${dish.slug}`;
  const description = `${dish.tagline} Brought to ${dish.appearances} potluck${dish.appearances === 1 ? "" : "s"} on Potlucky.`;

  return {
    title: `${dish.name} — The Potlucky Archive`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${dish.name} — The Potlucky Archive`,
      description,
      url,
      type: "article",
      siteName: "Potlucky",
      images: dish.photos[0]
        ? [{ url: dish.photos[0].src, width: 900, height: 900, alt: dish.photos[0].alt }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${dish.name} — The Potlucky Archive`,
      description,
      images: dish.photos[0] ? [dish.photos[0].src] : undefined,
    },
  };
}

/** Build a slug → { name, emoji } lookup from presets for deep-linking. */
function buildThemeLookup(): Record<string, { name: string; emoji: string }> {
  const map: Record<string, { name: string; emoji: string }> = {};
  for (const p of presets) {
    if (p.marketing?.slug) {
      map[p.marketing.slug] = { name: p.name, emoji: p.emoji };
    }
    // Also allow the internal id as a fallback slug.
    map[p.id] = { name: p.name, emoji: p.emoji };
  }
  // Themes that might not have a preset yet — fall back gracefully.
  const fallbacks: Record<string, { name: string; emoji: string }> = {
    "italian-night": { name: "Italian Night", emoji: "🍝" },
    "dinner-party": { name: "Dinner Party", emoji: "🍷" },
    "july-4th-potluck": { name: "July 4th", emoji: "🎆" },
    "birthday-potluck": { name: "Birthday Potluck", emoji: "🎂" },
    "friendsgiving-potluck": { name: "Friendsgiving", emoji: "🍽" },
    "thanksgiving-potluck": { name: "Thanksgiving", emoji: "🦃" },
    "easter-potluck": { name: "Easter", emoji: "🐣" },
  };
  return { ...fallbacks, ...map };
}

export default function DishPage({ params }: PageProps) {
  const dish = getDishBySlug(params.slug);
  if (!dish) notFound();

  const themeLookup = buildThemeLookup();

  return <DishDetail dish={dish} themeLookup={themeLookup} />;
}
