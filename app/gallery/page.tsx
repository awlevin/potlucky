import type { Metadata } from "next";
import { GalleryIndex } from "@/components/gallery/GalleryIndex";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "The Potlucky Archive — Every Dish, Every Potluck",
  description:
    "A living cookbook of real potluck dishes, with photos, bringers, and the events they appeared at. Browse by theme, season, course, or diet.",
  alternates: { canonical: `${SITE_URL}/gallery` },
  openGraph: {
    title: "The Potlucky Archive — Every Dish, Every Potluck",
    description:
      "Browse real photos of real potluck dishes. Filter by theme, season, course, or diet.",
    url: `${SITE_URL}/gallery`,
    type: "website",
    siteName: "Potlucky",
  },
};

export default function GalleryPage() {
  return <GalleryIndex />;
}
