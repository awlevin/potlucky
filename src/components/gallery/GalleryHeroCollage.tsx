"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { DishPhoto } from "@/data/dishGallery";

interface GalleryHeroCollageProps {
  photos: DishPhoto[];
}

/**
 * Polaroid collage for the /gallery hero.
 * Shown only >= 768px via CSS; on mobile the hero is type-only.
 * Each polaroid enters with a tiny delay + rotation via framer-motion, then
 * hovers lift on pointer interaction via CSS.
 */
export function GalleryHeroCollage({ photos }: GalleryHeroCollageProps) {
  const prefersReduced = useReducedMotion();
  const pics = photos.slice(0, 4);

  return (
    <div className="gallery-hero-collage" aria-hidden="true">
      {pics.map((p, i) => (
        <motion.div
          key={p.id}
          className="gallery-hero-collage-item"
          data-bringer={p.bringer.split(" ")[0]}
          initial={prefersReduced ? false : { opacity: 0, y: 20, rotate: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 * i, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <Image
            src={p.src}
            alt=""
            width={180}
            height={180}
            unoptimized
            style={{ display: "block", width: "100%", height: "auto", aspectRatio: "1 / 1", objectFit: "cover" }}
          />
        </motion.div>
      ))}
    </div>
  );
}
