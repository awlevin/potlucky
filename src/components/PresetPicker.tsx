"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getEvergreenPresets, presetToFoods, PotluckPreset } from "@/data/presets";
import { Food } from "@/types";

interface PresetPickerProps {
  onApply: (foods: Food[], name?: string, date?: string) => void;
  hostName?: string;
  viewerIsHost?: boolean;
}

export function PresetPicker({ onApply, hostName, viewerIsHost }: PresetPickerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const evergreenPresets = useMemo(() => getEvergreenPresets(), []);

  if (dismissed) {
    const copy = viewerIsHost
      ? "Nothing on the menu yet — start things off with a dish."
      : hostName
        ? `Nothing on the menu yet — be the first to bring something for ${hostName}'s potluck.`
        : "No dishes yet. Add something delicious!";
    return <div className="empty-state">{copy}</div>;
  }

  const handleSelect = (preset: PotluckPreset) => {
    const foods = presetToFoods(preset);
    onApply(foods, preset.name, preset.date);
  };

  if (!expanded) {
    return (
      <div className="preset-picker preset-picker-collapsed">
        <button
          type="button"
          className="preset-picker-trigger"
          onClick={() => setExpanded(true)}
          aria-expanded="false"
        >
          <span className="preset-picker-trigger-label">
            <span aria-hidden="true" className="preset-picker-trigger-emoji">✨</span>
            Quick-start from a theme
          </span>
          <span className="preset-picker-trigger-chevron" aria-hidden="true">›</span>
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="preset-picker preset-picker-expanded"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="preset-picker-header">
        <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
          Pick a theme to pre-fill the menu
        </span>
        <button
          className="btn-ghost btn-xs"
          onClick={() => setDismissed(true)}
          type="button"
          style={{ fontSize: "12px" }}
        >
          or start blank
        </button>
      </div>
      <div className="preset-picker-grid">
        <AnimatePresence>
          {evergreenPresets.map((preset, i) => (
            <motion.button
              key={preset.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: Math.min(i, 8) * 0.025 }}
              className="preset-picker-tile"
              onClick={() => handleSelect(preset)}
              type="button"
            >
              <span style={{ fontSize: "1.5rem" }}>{preset.emoji}</span>
              <span className="preset-picker-tile-name">{preset.name}</span>
              <span className="preset-picker-tile-count">
                {preset.dishes.length} dishes
              </span>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
