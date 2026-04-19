import type { MetadataRoute } from "next";
import { getMarketablePresets } from "@/data/presets";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/ideas`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
  ];

  const ideaRoutes: MetadataRoute.Sitemap = getMarketablePresets().map((p) => ({
    url: `${SITE_URL}/ideas/${p.marketing!.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...ideaRoutes];
}
