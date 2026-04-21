"use client";

import { User, DietaryRestriction } from "@/types";
import { DietaryBadges } from "@/components/IdentityGate";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DIETARY_OPTIONS: { key: DietaryRestriction; label: string; emoji: string }[] = [
  { key: "vegetarian", label: "Vegetarian", emoji: "🌱" },
  { key: "vegan", label: "Vegan", emoji: "🌿" },
  { key: "gluten-free", label: "Gluten-free", emoji: "GF" },
  { key: "nut-free", label: "Nut-free", emoji: "🥜✕" },
  { key: "dairy-free", label: "Dairy-free", emoji: "🥛✕" },
];

interface IdentityBarProps {
  user: User;
  isHost?: boolean;
  onSwitch: () => void;
  onUpdateDietary?: (restrictions: DietaryRestriction[], note?: string) => void;
}

export function IdentityBar({ user, isHost, onSwitch, onUpdateDietary }: IdentityBarProps) {
  const [editing, setEditing] = useState(false);
  const [selectedRestrictions, setSelectedRestrictions] = useState<DietaryRestriction[]>(
    user.dietaryRestrictions || []
  );
  const [noteInput, setNoteInput] = useState(user.dietaryNote || "");

  const toggleRestriction = (key: DietaryRestriction) => {
    setSelectedRestrictions((prev) =>
      prev.includes(key) ? prev.filter((r) => r !== key) : [...prev, key]
    );
  };

  const handleSave = () => {
    onUpdateDietary?.(selectedRestrictions, noteInput.trim() || undefined);
    setEditing(false);
  };

  const handleCancel = () => {
    setSelectedRestrictions(user.dietaryRestrictions || []);
    setNoteInput(user.dietaryNote || "");
    setEditing(false);
  };

  return (
    <div className="identity-bar">
      <div className="identity-bar-main">
        <span style={{ fontSize: "0.875rem" }}>
          You&apos;re{" "}
          <strong style={{ fontWeight: 600 }}>{user.name}</strong>
          {isHost && <span className="host-mark">host</span>}{" "}
          <DietaryBadges
            restrictions={user.dietaryRestrictions}
            note={user.dietaryNote}
            size="sm"
          />
          <span role="img" aria-label="wave">
            👋
          </span>
        </span>
        <span className="identity-bar-actions">
          {!editing && (
            <button
              className="btn-ghost"
              onClick={() => setEditing(true)}
              style={{
                cursor: "pointer",
                fontSize: "0.8125rem",
                color: "var(--color-text-muted)",
                background: "none",
                border: "none",
                textDecoration: "underline",
                textUnderlineOffset: "2px",
                padding: "2px 4px",
              }}
              title="Edit dietary restrictions"
            >
              Diet
            </button>
          )}
          <button
            className="btn-ghost"
            onClick={onSwitch}
            style={{
              cursor: "pointer",
              fontSize: "0.8125rem",
              color: "var(--color-text-muted)",
              background: "none",
              border: "none",
              textDecoration: "underline",
              textUnderlineOffset: "2px",
              padding: "2px 4px",
            }}
          >
            Not you?
          </button>
        </span>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div
            className="identity-dietary-edit"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="dietary-picker dietary-picker-compact">
              {DIETARY_OPTIONS.map(({ key, label, emoji }) => (
                <button
                  key={key}
                  className={`dietary-picker-chip dietary-picker-chip-sm ${
                    selectedRestrictions.includes(key) ? "dietary-picker-chip-selected" : ""
                  }`}
                  onClick={() => toggleRestriction(key)}
                  type="button"
                >
                  <span className="dietary-picker-emoji">{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <input
              className="input"
              placeholder="Other restrictions..."
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              style={{ marginTop: "8px", fontSize: "0.8125rem" }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button className="btn btn-sm" onClick={handleSave}>
                Save
              </button>
              <button className="btn btn-sm btn-ghost" onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
