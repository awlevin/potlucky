// Brand fonts for `next/og` ImageResponse cards (Satori needs raw font
// data; it cannot use next/font). Loaded from a pinned CDN build so the
// cards match the site: Fraunces for headings, DM Sans for body text.
// Every loader fails soft — a missing font falls back to a system stack
// rather than breaking the image.

type Weight = 400 | 500 | 600 | 700;
type Style = "normal" | "italic";
export type OgFont = { name: string; data: ArrayBuffer; weight: Weight; style: Style };

const FONT_URLS = {
  frauncesBold: {
    name: "Fraunces",
    weight: 700,
    style: "normal",
    url: "https://cdn.jsdelivr.net/npm/@fontsource/fraunces@5.0.16/files/fraunces-latin-700-normal.woff",
  },
  frauncesItalic: {
    name: "Fraunces",
    weight: 500,
    style: "italic",
    url: "https://cdn.jsdelivr.net/npm/@fontsource/fraunces@5.0.16/files/fraunces-latin-500-italic.woff",
  },
  dmSansRegular: {
    name: "DM Sans",
    weight: 400,
    style: "normal",
    url: "https://cdn.jsdelivr.net/npm/@fontsource/dm-sans@5.0.9/files/dm-sans-latin-400-normal.woff",
  },
  dmSansSemibold: {
    name: "DM Sans",
    weight: 600,
    style: "normal",
    url: "https://cdn.jsdelivr.net/npm/@fontsource/dm-sans@5.0.9/files/dm-sans-latin-600-normal.woff",
  },
} as const satisfies Record<string, { name: string; weight: Weight; style: Style; url: string }>;

export type OgFontKey = keyof typeof FONT_URLS;

async function load(url: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    return await res.arrayBuffer();
  } catch {
    return null;
  }
}

/**
 * Loads the requested fonts in parallel. Returns the fonts that loaded plus
 * ready-to-use font-family stacks that fall back cleanly when one did not.
 */
export async function loadOgFonts(keys: OgFontKey[]) {
  const loaded = await Promise.all(
    keys.map(async (key): Promise<OgFont | null> => {
      const spec = FONT_URLS[key];
      const data = await load(spec.url);
      return data ? { name: spec.name, data, weight: spec.weight, style: spec.style } : null;
    })
  );
  const fonts = loaded.filter((f): f is OgFont => f !== null);
  const has = (name: string) => fonts.some((f) => f.name === name);
  return {
    fonts: fonts.length ? fonts : undefined,
    serif: has("Fraunces") ? "Fraunces, Georgia, serif" : "Georgia, serif",
    sans: has("DM Sans") ? '"DM Sans", system-ui, sans-serif' : "system-ui, sans-serif",
  };
}
