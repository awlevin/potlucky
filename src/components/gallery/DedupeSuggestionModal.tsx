"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

export interface DedupeCandidate {
  slug: string;
  name: string;
  appearances: number;
  heroPhotoUrl?: string;
  similarity: number;
}

interface DedupeSuggestionModalProps {
  dishTitle: string;
  previewUrl: string;
  candidates: DedupeCandidate[];
  onResolve: (action: "link" | "keep-separate", targetSlug?: string) => void;
  onClose: () => void;
}

/**
 * Shown right before upload if we find gallery dishes that share a name.
 * The user is asked: "Is this the same as X?" — picking a match links the
 * upload to an existing dish, "Keep separate" creates a new dish entry.
 *
 * Respects Escape to dismiss + focus-traps the first actionable button.
 */
export function DedupeSuggestionModal({
  dishTitle,
  previewUrl,
  candidates,
  onResolve,
  onClose,
}: DedupeSuggestionModalProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Autofocus first button for keyboard users
    const firstBtn = rootRef.current?.querySelector<HTMLElement>(
      "button, [href]",
    );
    firstBtn?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="dedupe-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dedupe-modal-title"
    >
      <motion.div
        ref={rootRef}
        className="dedupe-modal"
        onClick={(e) => e.stopPropagation()}
        initial={prefersReduced ? false : { opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
      >
        <button
          type="button"
          className="dedupe-modal-close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ×
        </button>
        <div className="dedupe-modal-eyebrow">Before we upload</div>
        <h2 id="dedupe-modal-title" className="dedupe-modal-title">
          Is this the same dish?
        </h2>
        <p className="dedupe-modal-body">
          We found {candidates.length === 1 ? "a dish" : `${candidates.length} dishes`}{" "}
          in the archive that look like <em>{dishTitle}</em>. Linking them
          keeps every photo in one place.
        </p>

        {/* Your upload preview for reference */}
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            padding: "10px 12px",
            marginBottom: 14,
            background: "var(--color-brand-light)",
            borderRadius: "var(--radius)",
            border: "1px dashed var(--color-brand)",
          }}
        >
          <Image
            src={previewUrl}
            alt="Your upload"
            width={48}
            height={48}
            unoptimized
            style={{
              width: 48,
              height: 48,
              borderRadius: 6,
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-fraunces), Georgia, serif",
                fontStyle: "italic",
                fontSize: 13,
                color: "var(--color-text-muted)",
              }}
            >
              Your upload
            </div>
            <div
              style={{
                fontFamily: "var(--font-fraunces), Georgia, serif",
                fontWeight: 500,
                fontSize: 14,
                color: "var(--color-text)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {dishTitle}
            </div>
          </div>
        </div>

        <div className="dedupe-modal-options">
          {candidates.map((c) => (
            <button
              key={c.slug}
              type="button"
              className="dedupe-modal-option"
              onClick={() => onResolve("link", c.slug)}
            >
              {c.heroPhotoUrl ? (
                <Image
                  src={c.heroPhotoUrl}
                  alt=""
                  width={48}
                  height={48}
                  unoptimized
                  className="dedupe-modal-option-photo"
                />
              ) : (
                <div
                  className="dedupe-modal-option-photo"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                  aria-hidden="true"
                >
                  🥣
                </div>
              )}
              <div className="dedupe-modal-option-text">
                <div className="dedupe-modal-option-name">{c.name}</div>
                <div className="dedupe-modal-option-meta">
                  Brought {c.appearances}×
                </div>
              </div>
              <div className="dedupe-modal-option-sim">
                {Math.round(c.similarity * 100)}%
              </div>
            </button>
          ))}
        </div>

        <div className="dedupe-modal-actions">
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => onResolve("keep-separate")}
          >
            Keep separate
          </button>
        </div>
      </motion.div>
    </div>
  );
}
