import type { Metadata } from "next";
import Link from "next/link";
import { getMarketablePresets } from "@/data/presets";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Potluck Ideas & Themes — Free Sign-Up Sheet Templates | Potlucky",
  description:
    "Browse curated potluck themes — Thanksgiving, Friendsgiving, Christmas, 4th of July, Halloween, Super Bowl, vegan, pizza night, and more. Free sign-up sheets, no accounts needed.",
  alternates: { canonical: `${SITE_URL}/ideas` },
  openGraph: {
    title: "Potluck Ideas & Themes — Free Sign-Up Sheet Templates",
    description:
      "Curated potluck themes for every holiday and occasion. Share a link, claim dishes, feast together.",
    url: `${SITE_URL}/ideas`,
    type: "website",
    siteName: "Potlucky",
  },
  twitter: {
    card: "summary_large_image",
    title: "Potluck Ideas & Themes — Free Sign-Up Sheet Templates",
    description:
      "Curated potluck themes for every holiday and occasion. Share a link, claim dishes, feast together.",
  },
};

export default function IdeasHubPage() {
  const marketable = getMarketablePresets();

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
          { "@type": "ListItem", position: 2, name: "Ideas", item: `${SITE_URL}/ideas` },
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
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="hero ideas-hero">
        <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
          <h1 className="hero-heading" style={{ textAlign: "center", marginBottom: "12px" }}>
            Potluck Ideas for Every Occasion
          </h1>
          <p className="ideas-hero-sub">
            Free sign-up sheets, hand-picked menus, and one-click setup for
            every holiday and theme. No accounts, no spreadsheets.
          </p>
        </div>
      </section>

      <section style={{ padding: "0 16px 48px" }}>
        <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
          <div className="preset-cards-grid">
            {marketable.map((preset) => (
              <Link
                key={preset.id}
                href={`/ideas/${preset.marketing!.slug}`}
                className="preset-card"
                style={{ textDecoration: "none" }}
              >
                <span className="preset-card-emoji">{preset.emoji}</span>
                <span className="preset-card-name">{preset.name}</span>
                <span className="preset-card-meta">
                  <span>{preset.dishes.length} dishes</span>
                  {preset.date ? (
                    <span className="preset-card-meta-date">{preset.date}</span>
                  ) : null}
                </span>
                <span className="preset-card-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
