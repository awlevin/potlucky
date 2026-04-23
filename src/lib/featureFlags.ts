/**
 * Feature flags.
 *
 * Flags are read from `NEXT_PUBLIC_*` env vars so the same value is available
 * on the server (RSC/route handlers) and the client (inlined at build time).
 * Missing or unrecognised values default to OFF — explicitly set `"1"` or
 * `"true"` to enable.
 *
 * Set locally in `.env.local`; set per-environment in Vercel → Project →
 * Settings → Environment Variables.
 */

function flag(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

export const featureFlags = {
  /**
   * The Dish Gallery / recipe-archive feature family:
   *   - `/gallery` and `/gallery/[slug]` routes
   *   - NavMenu "Archive" link
   *   - DishPhotoStrip + DishPhotoBadge on `/ideas/[slug]`
   *   - PostEventUploadPrompt on `/potlucks/[roomId]`
   *
   * Grouped under a single flag because the photo strips link back to the
   * gallery — splitting them creates dead links.
   */
  dishGallery: flag(process.env.NEXT_PUBLIC_FEATURE_DISH_GALLERY),
};
