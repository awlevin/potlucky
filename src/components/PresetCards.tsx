"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { PotluckPreset } from "@/data/presets";

interface PresetCardsProps {
  presets: PotluckPreset[];
  onSelect: (preset: PotluckPreset) => void;
  loading: boolean;
}

function PresetCard({
  preset,
  index,
  onSelect,
  disabled,
}: {
  preset: PotluckPreset;
  index: number;
  onSelect: () => void;
  disabled: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      style={{ opacity: isInView ? undefined : 0 }}
    >
      <button
        className="preset-card"
        onClick={onSelect}
        disabled={disabled}
        type="button"
      >
        <span className="preset-card-emoji">{preset.emoji}</span>
        <span className="preset-card-name">{preset.name}</span>
        <span className="preset-card-meta">
          {preset.dishes.length} dishes
          {preset.date ? ` · ${preset.date}` : ""}
        </span>
        <span className="preset-card-arrow">→</span>
      </button>
    </motion.div>
  );
}

export function PresetCards({ presets, onSelect, loading }: PresetCardsProps) {
  const displayed = presets.slice(0, 8);

  return (
    <div style={{ padding: "0 16px 48px" }}>
      <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
        <p
          style={{
            textAlign: "center",
            fontSize: "0.875rem",
            color: "var(--color-text-muted)",
            marginBottom: "16px",
          }}
        >
          or start with a theme
        </p>
        <div className="preset-cards-grid">
          {displayed.map((preset, i) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              index={i}
              onSelect={() => onSelect(preset)}
              disabled={loading}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
