"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { presets, presetToFoods, PotluckPreset } from "@/data/presets";
import { Food } from "@/types";

interface PresetPickerProps {
  onApply: (foods: Food[], name?: string, date?: string) => void;
}

export function PresetPicker({ onApply }: PresetPickerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return (
      <div className="empty-state">
        No dishes yet. Add something delicious!
      </div>
    );
  }

  const handleSelect = (preset: PotluckPreset) => {
    const foods = presetToFoods(preset);
    onApply(foods, preset.name, preset.date);
  };

  return (
    <div className="preset-picker">
      <div className="preset-picker-header">
        <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
          Quick start with a theme
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
          {presets.map((preset, i) => (
            <motion.button
              key={preset.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25, delay: i * 0.04 }}
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
    </div>
  );
}
