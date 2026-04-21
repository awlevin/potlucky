"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { DedupeSuggestionModal, type DedupeCandidate } from "./DedupeSuggestionModal";
import { galleryDishes, fuzzyMatchDishName } from "@/data/dishGallery";

export interface ClaimedDish {
  id: string;
  title: string;
  /** If the user has previously uploaded a photo for this dish, show it. */
  existingPhotoUrl?: string;
  /** Gallery slug if this dish is already canonicalized. */
  gallerySlug?: string;
}

interface PostEventUploadPromptProps {
  /** Pretty human name, e.g. "Ricci Birthday 2025". */
  potluckName: string;
  /** ISO event date — used for the "How did it go?" nudge copy. */
  eventDate: string;
  /** The dishes this specific user claimed at this potluck. */
  claimedDishes: ClaimedDish[];
  /** Currently-signed-in user name for byline attribution. */
  userName: string;
}

type UploadState =
  | { phase: "idle" }
  | { phase: "uploading"; progress: number; previewUrl: string }
  | { phase: "success"; previewUrl: string }
  | { phase: "pending"; previewUrl: string }
  | { phase: "error"; message: string }
  | { phase: "existing"; url: string };

/**
 * Post-event prompt. Appears in the potluck room once the event date has
 * passed. For every dish the user claimed, shows a warm "How did the X
 * turn out?" card with an inline dropzone + caption field + dedupe flow.
 *
 * Keeps all upload state local — the parent just passes claimed dishes.
 * When we wire this up to real uploads, replace the setTimeout fake with
 * the actual upload mutation.
 */
export function PostEventUploadPrompt({
  potluckName,
  eventDate,
  claimedDishes,
  userName,
}: PostEventUploadPromptProps) {
  const [states, setStates] = useState<Record<string, UploadState>>(() => {
    const init: Record<string, UploadState> = {};
    for (const d of claimedDishes) {
      init[d.id] = d.existingPhotoUrl
        ? { phase: "existing", url: d.existingPhotoUrl }
        : { phase: "idle" };
    }
    return init;
  });
  const [captions, setCaptions] = useState<Record<string, string>>({});
  const [dedupeFor, setDedupeFor] = useState<{
    dishId: string;
    dishTitle: string;
    previewUrl: string;
    candidates: DedupeCandidate[];
  } | null>(null);

  const daysSince = useDaysSince(eventDate);

  const handleFile = useCallback(
    (dish: ClaimedDish, file: File) => {
      const previewUrl = URL.createObjectURL(file);

      // Find dedupe candidates before kicking off the upload. If there are
      // any, surface the modal first — otherwise just upload straight
      // through.
      const candidates = findDedupeCandidates(dish.title);
      if (candidates.length > 0) {
        setDedupeFor({
          dishId: dish.id,
          dishTitle: dish.title,
          previewUrl,
          candidates,
        });
        return;
      }
      simulateUpload(dish.id, previewUrl);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const simulateUpload = useCallback(
    (dishId: string, previewUrl: string) => {
      setStates((s) => ({
        ...s,
        [dishId]: { phase: "uploading", progress: 0, previewUrl },
      }));
      let progress = 0;
      const tick = () => {
        progress += 15 + Math.random() * 20;
        if (progress >= 100) {
          setStates((s) => ({
            ...s,
            [dishId]: { phase: "success", previewUrl },
          }));
          // Flip to "pending moderation" after the success celebration.
          setTimeout(() => {
            setStates((s) =>
              s[dishId]?.phase === "success"
                ? { ...s, [dishId]: { phase: "pending", previewUrl } }
                : s,
            );
          }, 1500);
        } else {
          setStates((s) => ({
            ...s,
            [dishId]: { phase: "uploading", progress, previewUrl },
          }));
          setTimeout(tick, 220);
        }
      };
      setTimeout(tick, 220);
    },
    [],
  );

  // Clean up object URLs when the component unmounts so we don't leak.
  useEffect(() => {
    return () => {
      Object.values(states).forEach((s) => {
        if ("previewUrl" in s) URL.revokeObjectURL(s.previewUrl);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onDedupeResolved = useCallback(
    (action: "link" | "keep-separate") => {
      if (!dedupeFor) return;
      // In a real implementation we'd stash the `action` and pass it to
      // the upload mutation. Either way, the upload proceeds.
      void action;
      simulateUpload(dedupeFor.dishId, dedupeFor.previewUrl);
      setDedupeFor(null);
    },
    [dedupeFor, simulateUpload],
  );

  if (claimedDishes.length === 0) return null;

  return (
    <section
      className="upload-prompt-section"
      aria-labelledby="upload-prompt-heading"
    >
      <div className="upload-prompt-section-header">
        <h2
          id="upload-prompt-heading"
          className="upload-prompt-section-title"
        >
          How&rsquo;d it go?
        </h2>
      </div>
      <p className="upload-prompt-section-sub">
        {daysSince > 0
          ? `It's been ${daysSince} day${daysSince === 1 ? "" : "s"} since ${potluckName}.`
          : potluckName}
        {" "}Snap a photo of what you brought so future hosts can see the real
        thing. Totally optional — but the gallery gets better every time.
      </p>

      <ul className="upload-prompt-list">
        {claimedDishes.map((dish) => {
          const state = states[dish.id] ?? { phase: "idle" };
          return (
            <li key={dish.id}>
              <UploadPromptCard
                dish={dish}
                state={state}
                caption={captions[dish.id] ?? ""}
                onCaptionChange={(v) =>
                  setCaptions((c) => ({ ...c, [dish.id]: v }))
                }
                onFile={(file) => handleFile(dish, file)}
                onSkip={() =>
                  setStates((s) => ({
                    ...s,
                    [dish.id]: { phase: "idle" },
                  }))
                }
                onRetry={() =>
                  setStates((s) => ({
                    ...s,
                    [dish.id]: { phase: "idle" },
                  }))
                }
                userName={userName}
              />
            </li>
          );
        })}
      </ul>

      {dedupeFor && (
        <DedupeSuggestionModal
          dishTitle={dedupeFor.dishTitle}
          previewUrl={dedupeFor.previewUrl}
          candidates={dedupeFor.candidates}
          onResolve={onDedupeResolved}
          onClose={() => {
            // Close without uploading — user bailed out.
            URL.revokeObjectURL(dedupeFor.previewUrl);
            setDedupeFor(null);
          }}
        />
      )}
    </section>
  );
}

// --- Single card --------------------------------------------------------------

interface UploadPromptCardProps {
  dish: ClaimedDish;
  state: UploadState;
  caption: string;
  onCaptionChange: (v: string) => void;
  onFile: (f: File) => void;
  onSkip: () => void;
  onRetry: () => void;
  userName: string;
}

function UploadPromptCard({
  dish,
  state,
  caption,
  onCaptionChange,
  onFile,
  onSkip,
  onRetry,
  userName,
}: UploadPromptCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const prefersReduced = useReducedMotion();

  const handleSelect = () => inputRef.current?.click();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) onFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    // Reset so re-selecting the same file still triggers onChange.
    e.target.value = "";
  };

  const question = getQuestion(dish.title);

  return (
    <motion.div
      className="upload-prompt-card"
      initial={prefersReduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`upload-prompt-dropzone ${isDragging ? "upload-prompt-dropzone-active" : ""}`}
        onClick={
          state.phase === "idle" || state.phase === "error"
            ? handleSelect
            : undefined
        }
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (state.phase !== "idle" && state.phase !== "error") return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleSelect();
          }
        }}
        aria-label={`Add a photo of ${dish.title}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          style={{ display: "none" }}
          aria-hidden="true"
        />

        {state.phase === "idle" && (
          <>
            <span className="upload-prompt-dropzone-icon" aria-hidden="true">
              📷
            </span>
            <span className="upload-prompt-dropzone-text">
              Tap or drop a photo
            </span>
          </>
        )}

        {state.phase === "existing" && (
          <Image
            src={state.url}
            alt={`Your photo of ${dish.title}`}
            fill
            unoptimized
            style={{ objectFit: "cover" }}
            className="upload-prompt-dropzone-preview"
          />
        )}

        {(state.phase === "uploading" ||
          state.phase === "success" ||
          state.phase === "pending") && (
          <>
            <Image
              src={state.previewUrl}
              alt=""
              fill
              unoptimized
              style={{ objectFit: "cover" }}
            />
            {state.phase === "uploading" && (
              <div className="upload-prompt-progress">
                <div className="upload-prompt-progress-num">
                  {Math.round(state.progress)}%
                </div>
                <div
                  className="upload-prompt-progress-bar"
                  role="progressbar"
                  aria-valuenow={Math.round(state.progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Uploading ${dish.title}`}
                >
                  <div
                    className="upload-prompt-progress-bar-fill"
                    style={{ width: `${state.progress}%` }}
                  />
                </div>
              </div>
            )}
            {state.phase === "success" && (
              <div className="upload-prompt-success">
                <span className="upload-prompt-success-check" aria-hidden="true">
                  ✓
                </span>
                <span className="upload-prompt-success-label">
                  On its way!
                </span>
              </div>
            )}
          </>
        )}

        {state.phase === "error" && (
          <>
            <span className="upload-prompt-dropzone-icon" aria-hidden="true">
              ⚠
            </span>
            <span className="upload-prompt-dropzone-text">Tap to retry</span>
          </>
        )}
      </div>

      <div className="upload-prompt-body">
        <div className="upload-prompt-dish-row">
          <span className="upload-prompt-dish-name">{dish.title}</span>
          {state.phase === "pending" && (
            <span className="upload-prompt-status-pending">
              Pending review
            </span>
          )}
        </div>
        <p className="upload-prompt-question">{question}</p>

        {(state.phase === "idle" ||
          state.phase === "uploading" ||
          state.phase === "success" ||
          state.phase === "pending") && (
          <>
            <label
              htmlFor={`caption-${dish.id}`}
              style={{
                fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-text-muted)",
              }}
            >
              Caption <span style={{ textTransform: "none", letterSpacing: 0 }}>(optional)</span>
            </label>
            <textarea
              id={`caption-${dish.id}`}
              className="upload-prompt-caption"
              rows={2}
              placeholder={`e.g. "Had to sub in cashews" or "Don't tell Mom."`}
              value={caption}
              onChange={(e) => onCaptionChange(e.target.value)}
              maxLength={280}
              disabled={state.phase === "pending"}
            />
          </>
        )}

        <div className="upload-prompt-actions">
          {state.phase === "idle" && (
            <>
              <button
                type="button"
                className="btn btn-sm"
                onClick={handleSelect}
              >
                + Add photo
              </button>
              <button
                type="button"
                className="upload-prompt-skip"
                onClick={onSkip}
              >
                Maybe later
              </button>
            </>
          )}
          {state.phase === "error" && (
            <>
              <div className="upload-prompt-error">
                <span aria-hidden="true">⚠</span>
                <span>{state.message}</span>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={onRetry}
              >
                Try again
              </button>
            </>
          )}
          {state.phase === "pending" && (
            <span
              style={{
                fontFamily: "var(--font-fraunces), Georgia, serif",
                fontStyle: "italic",
                fontSize: 12.5,
                color: "var(--color-text-muted)",
              }}
            >
              Uploaded by {userName}. We&rsquo;ll quietly review and add it
              to the gallery within a day.
            </span>
          )}
          {state.phase === "existing" && (
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleSelect}
            >
              Replace photo
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// --- Utilities ---------------------------------------------------------------

function useDaysSince(iso: string): number {
  const [days, setDays] = useState<number>(() => diffDays(iso));
  useEffect(() => {
    setDays(diffDays(iso));
  }, [iso]);
  return days;
}

function diffDays(iso: string): number {
  const now = Date.now();
  const then = new Date(iso).getTime();
  return Math.max(0, Math.floor((now - then) / (1000 * 60 * 60 * 24)));
}

function getQuestion(title: string): string {
  const first = title.split(" ")[0].toLowerCase();
  if (["brownies", "cake", "pie", "cookies"].some((w) => title.toLowerCase().includes(w))) {
    return `How'd the ${title.toLowerCase()} turn out?`;
  }
  if (first === "the" || first === "a") {
    return `Got a shot of ${title.toLowerCase()}?`;
  }
  return `Got a photo of your ${title.toLowerCase()}?`;
}

/** Find gallery dishes whose names fuzzy-match this title — dedupe candidates. */
function findDedupeCandidates(title: string): DedupeCandidate[] {
  return galleryDishes
    .filter((d) => fuzzyMatchDishName(d.name, title))
    .map((d) => ({
      slug: d.slug,
      name: d.name,
      appearances: d.appearances,
      heroPhotoUrl: d.photos[0]?.src,
      similarity: fuzzyScore(d.name, title),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 3);
}

function fuzzyScore(a: string, b: string): number {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean);
  const aw = norm(a);
  const bw = norm(b);
  const overlap = aw.filter((w) => bw.includes(w)).length;
  return overlap / Math.max(aw.length, bw.length, 1);
}
