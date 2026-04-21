"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { GalleryDish } from "@/data/dishGallery";

interface DishCardProps {
  dish: GalleryDish;
  index?: number;
}

/**
 * DishCard — index-card/polaroid hybrid.
 * - Hero photo top, subtle wax-seal badge in the corner with appearance count.
 * - Body has a cream "ruled-paper" background, dish name in Fraunces,
 *   bringer attribution hand-written in Caveat.
 * - Staggered mount animation (first row animates quickly, later rows fade
 *   in with a slight delay). We intentionally don't use `useInView` because
 *   it trips on off-screen cards for fullPage screenshots and on users who
 *   deep-link to a filtered result set — we want every card visible once
 *   JS has hydrated.
 */
export function DishCard({ dish, index = 0 }: DishCardProps) {
  const prefersReduced = useReducedMotion();

  const hero = dish.photos[0];
  const lastBringer = hero?.bringer;

  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.035, 0.45) }}
    >
      <Link href={`/gallery/${dish.slug}`} className="dish-card" aria-label={`View ${dish.name}`}>
        <div className="dish-card-photo">
          {hero ? (
            <Image
              src={hero.src}
              alt={hero.alt}
              fill
              sizes="(max-width: 520px) 45vw, (max-width: 1024px) 30vw, 280px"
              style={{ objectFit: "cover" }}
              unoptimized
            />
          ) : (
            <div className="dish-card-empty" aria-hidden="true">
              🥣
            </div>
          )}
          {dish.appearances > 0 && (
            <div
              className="dish-card-seal"
              aria-label={`Brought to ${dish.appearances} potluck${dish.appearances === 1 ? "" : "s"}`}
            >
              {dish.appearances}
              <sub>×</sub>
            </div>
          )}
        </div>
        <div className="dish-card-body">
          <h3 className="dish-card-name">{dish.name}</h3>
          <div className="dish-card-meta">
            <span>
              {dish.photos.length} photo{dish.photos.length === 1 ? "" : "s"}
            </span>
            {dish.saves > 0 && (
              <>
                <span className="dish-card-meta-dot" aria-hidden="true" />
                <span>{dish.saves} saves</span>
              </>
            )}
          </div>
          {lastBringer && (
            <div className="dish-card-bringer" aria-label={`Most recently brought by ${lastBringer}`}>
              — last, {lastBringer}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

/** Skeleton tile that mirrors DishCard's layout. Use during initial loads. */
export function DishCardSkeleton() {
  return (
    <div className="dish-card-skeleton" aria-hidden="true">
      <div className="dish-card-skeleton-photo" />
      <div className="dish-card-skeleton-body">
        <div className="dish-card-skeleton-line" />
        <div className="dish-card-skeleton-line short" />
      </div>
    </div>
  );
}
