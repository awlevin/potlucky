export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NODE_ENV === "production"
        ? "https://potlucky.app"
        : "http://localhost:3000");

export const SITE_NAME = "Potlucky";

/**
 * Returns `next` only if it is a same-site path ("/potlucks/abc?x=1").
 * Anything else — absolute URLs, protocol-relative "//host", backslash
 * tricks, or strings that would turn `${origin}${next}` into
 * "https://site@evil.com" — falls back to "/". Use this on every
 * user-controlled redirect target.
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return "/";
  }
  try {
    const base = "http://potlucky.invalid";
    const url = new URL(next, base);
    if (url.origin !== base) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}
