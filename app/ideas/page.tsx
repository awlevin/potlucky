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

  return (
    <main>
      <section className="hero" style={{ padding: "64px 16px 48px" }}>
        <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
          <h1 className="hero-heading" style={{ textAlign: "center", marginBottom: "16px" }}>
            Potluck Ideas for Every Occasion
          </h1>
          <p
            style={{
              textAlign: "center",
              fontSize: "1.125rem",
              color: "var(--color-text-secondary)",
              maxWidth: "36rem",
              margin: "0 auto",
              lineHeight: 1.5,
            }}
          >
            Free sign-up sheets, hand-picked menus, and one-click setup for
            every holiday and theme. No accounts, no spreadsheets.
          </p>
        </div>
      </section>

      <section style={{ padding: "0 16px 64px" }}>
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
                  {preset.dishes.length} dishes
                  {preset.date ? ` · ${preset.date}` : ""}
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
