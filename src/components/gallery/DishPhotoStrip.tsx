"use client";

import Link from "next/link";
import Image from "next/image";
import type { DishPhoto, GalleryDish } from "@/data/dishGallery";

interface DishPhotoStripProps {
  /** The canonical dish we matched this menu row to. Used for the "See all" card. */
  dish?: GalleryDish;
  photos: DishPhoto[];
  /** Called when a photo has been successfully matched to a dish. Drives the badge. */
  maxVisible?: number;
}

/**
 * Horizontally scrolling, snap-aligned photo strip. Rendered inline under
 * each menu row on the theme page. If there are no photos the empty nudge is
 * rendered instead — visually distinguishing rows that already have real
 * photos from the blanks.
 */
export function DishPhotoStrip({ dish, photos, maxVisible = 5 }: DishPhotoStripProps) {
  if (photos.length === 0) {
    return (
      <div className="dish-photo-strip-empty" role="note">
        <div className="dish-photo-strip-empty-icon" aria-hidden="true">
          📸
        </div>
        <span>
          No photos of this yet — be the first once your potluck is over.
        </span>
      </div>
    );
  }

  const shown = photos.slice(0, maxVisible);
  const remainder = photos.length - shown.length;

  return (
    <div
      className="dish-photo-strip"
      role="list"
      aria-label={dish ? `Photos of ${dish.name}` : "Dish photos"}
    >
      {shown.map((p) => (
        <Link
          key={p.id}
          href={`/potlucks/${p.potluckSlug}`}
          className="dish-photo-strip-item"
          role="listitem"
          aria-label={`${p.bringer} brought this to ${p.potluckName}`}
        >
          <Image
            src={p.src}
            alt={p.alt}
            width={220}
            height={220}
            unoptimized
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <span className="dish-photo-strip-item-label">
            {p.bringer.split(" ")[0]}
          </span>
        </Link>
      ))}
      {dish && (
        <Link
          href={`/gallery/${dish.slug}`}
          className="dish-photo-strip-more"
          role="listitem"
        >
          <span className="dish-photo-strip-more-arrow" aria-hidden="true">
            →
          </span>
          {remainder > 0
            ? `+${remainder} more`
            : `See all ${photos.length}`}
        </Link>
      )}
    </div>
  );
}

export function DishPhotoBadge({ count }: { count: number }) {
  return (
    <span
      className="menu-dish-photo-badge"
      aria-label={`${count} real photos`}
    >
      📷 {count}
    </span>
  );
}
