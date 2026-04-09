"use client";
import { useState, useEffect } from "react";
import { Food } from "@/types";

const CONFETTI_COLORS = [
  "var(--color-brand)",    // amber
  "var(--color-accent)",   // green
  "var(--color-warm)",     // coral
  "#FFF7E8",               // cream
];

function ConfettiOverlay({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [onDone]);

  const pieces = Array.from({ length: 30 }, (_, i) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 1.5;
    const duration = 2 + Math.random() * 2;
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const isCircle = i % 3 === 0;

    return (
      <div
        key={i}
        className="confetti-piece"
        style={{
          left: `${left}%`,
          background: color,
          borderRadius: isCircle ? "50%" : "2px",
          animationDelay: `${delay}s`,
          animationDuration: `${duration}s`,
        }}
      />
    );
  });

  return <div className="confetti-overlay">{pieces}</div>;
}

export function ProgressBar({ foods }: { foods: Food[] }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const total = foods.length;
  const claimed = foods.filter((f) => Array.isArray(f.claimedBy) ? f.claimedBy.length > 0 : !!f.claimedBy).length;
  const percent = total === 0 ? 0 : Math.round((claimed / total) * 100);
  const isComplete = total > 0 && claimed === total;

  useEffect(() => {
    if (isComplete && !hasTriggered) {
      setShowConfetti(true);
      setHasTriggered(true);
    }
  }, [isComplete, hasTriggered]);

  if (total === 0) return null;

  return (
    <div className="progress-container">
      <div className="progress-label">
        <span>
          {claimed} of {total} dishes claimed
        </span>
        {isComplete && (
          <span className="progress-complete">All set! 🎉</span>
        )}
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${percent}%` }}
        />
      </div>
      {showConfetti && (
        <ConfettiOverlay onDone={() => setShowConfetti(false)} />
      )}
    </div>
  );
}
