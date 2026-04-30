"use client";

import { useState } from "react";
import { User, DietaryRestriction } from "@/types";
import { AnimatePresence, motion } from "framer-motion";

export const DIETARY_OPTIONS: { key: DietaryRestriction; label: string; emoji: string }[] = [
  { key: "vegetarian", label: "Vegetarian", emoji: "🌱" },
  { key: "vegan", label: "Vegan", emoji: "🌿" },
  { key: "gluten-free", label: "Gluten-free", emoji: "GF" },
  { key: "nut-free", label: "Nut-free", emoji: "🥜✕" },
  { key: "dairy-free", label: "Dairy-free", emoji: "🥛✕" },
];

export function DietaryBadges({
  restrictions,
  note,
  size = "sm",
}: {
  restrictions?: DietaryRestriction[];
  note?: string;
  size?: "sm" | "xs";
}) {
  if (!restrictions?.length && !note) return null;
  return (
    <span className={`dietary-badges dietary-badges-${size}`}>
      {restrictions?.map((r) => {
        const opt = DIETARY_OPTIONS.find((o) => o.key === r);
        return (
          <span key={r} className="dietary-badge-inline" title={opt?.label || r}>
            {opt?.emoji || r}
          </span>
        );
      })}
      {note && (
        <span className="dietary-badge-note" title={note}>
          +
        </span>
      )}
    </span>
  );
}

interface IdentityGateProps {
  users: User[];
  hostIds?: string[];
  onSelectExisting: (user: User) => void;
  onCreateNew: (
    name: string,
    dietaryRestrictions?: DietaryRestriction[],
    dietaryNote?: string
  ) => void;
}

export function IdentityGate({
  users,
  hostIds,
  onSelectExisting,
  onCreateNew,
}: IdentityGateProps) {
  const isEmptyRoom = users.length === 0;
  // Empty room → jump straight to the name input, since there's no one else
  // to pick from. Populated room → keep the "I'm one of these people" list
  // and reveal the input only when someone picks "I'm someone new".
  const [showNewInput, setShowNewInput] = useState(isEmptyRoom);
  const [newName, setNewName] = useState("");
  const [step, setStep] = useState<"name" | "dietary">("name");
  const [selectedRestrictions, setSelectedRestrictions] = useState<DietaryRestriction[]>([]);
  const [dietaryNote, setDietaryNote] = useState("");

  const handleNameNext = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setStep("dietary");
  };

  const handleFinish = () => {
    onCreateNew(
      newName.trim(),
      selectedRestrictions.length ? selectedRestrictions : undefined,
      dietaryNote.trim() || undefined
    );
  };

  const handleSkip = () => {
    onCreateNew(newName.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (step === "name") {
        handleNameNext();
      } else {
        handleFinish();
      }
    }
  };

  const toggleRestriction = (key: DietaryRestriction) => {
    setSelectedRestrictions((prev) =>
      prev.includes(key) ? prev.filter((r) => r !== key) : [...prev, key]
    );
  };

  return (
    <div className="identity-overlay">
      <motion.div
        className="card identity-card"
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <AnimatePresence mode="wait">
          {step === "name" ? (
            <motion.div
              key="name-step"
              initial={{ opacity: 0, x: 0 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  fontWeight: 600,
                  fontSize: "1.5rem",
                  textAlign: "center",
                  marginBottom: "4px",
                  color: "var(--color-text)",
                }}
              >
                {isEmptyRoom ? "Let's get you set up." : "Who are you?"}
              </h2>
              <p
                style={{
                  textAlign: "center",
                  color: "var(--color-text-muted)",
                  fontSize: "0.875rem",
                  marginBottom: "1.5rem",
                }}
              >
                {isEmptyRoom
                  ? "Your name goes on the invite. Friends will see who's hosting when they join."
                  : "Pick your name so we know who's bringing what."}
              </p>

              {users.length > 0 && (
                <div style={{ marginBottom: "1rem" }}>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--color-text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      marginBottom: "0.5rem",
                    }}
                  >
                    I&apos;m one of these people
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <AnimatePresence>
                      {users.map((user) => (
                        <motion.button
                          key={user.id}
                          className="pill"
                          onClick={() => onSelectExisting(user)}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileTap={{ scale: 0.95 }}
                          style={{ cursor: "pointer" }}
                        >
                          {user.name}
                          {hostIds?.includes(user.id) && (
                            <span className="host-mark">host</span>
                          )}
                          <DietaryBadges
                            restrictions={user.dietaryRestrictions}
                            note={user.dietaryNote}
                            size="xs"
                          />
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              <div
                style={{
                  borderTop: users.length > 0 ? "1px solid var(--color-border)" : "none",
                  paddingTop: users.length > 0 ? "1rem" : "0",
                }}
              >
                {!showNewInput ? (
                  <button
                    className="btn btn-outline"
                    onClick={() => setShowNewInput(true)}
                    style={{ width: "100%" }}
                  >
                    I&apos;m someone new
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.2 }}
                  >
                    <p
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        marginBottom: "0.5rem",
                      }}
                    >
                      What&apos;s your name?
                    </p>
                    <div className="input-row">
                      <input
                        className="input"
                        placeholder="Your name..."
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                      />
                      <button
                        className="btn"
                        onClick={handleNameNext}
                        disabled={!newName.trim()}
                      >
                        Next
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dietary-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <button
                className="identity-back-btn"
                onClick={() => setStep("name")}
                type="button"
                aria-label="Back to name step"
              >
                &larr;
              </button>
              <h2
                style={{
                  fontFamily: "var(--font-fraunces), Georgia, serif",
                  fontWeight: 600,
                  fontSize: "1.5rem",
                  textAlign: "center",
                  marginBottom: "4px",
                  color: "var(--color-text)",
                }}
              >
                Any dietary needs?
              </h2>
              <p
                style={{
                  textAlign: "center",
                  color: "var(--color-text-muted)",
                  fontSize: "0.875rem",
                  marginBottom: "1.5rem",
                }}
              >
                This helps the group plan dishes everyone can enjoy.
              </p>

              <div className="dietary-picker">
                {DIETARY_OPTIONS.map(({ key, label, emoji }) => (
                  <button
                    key={key}
                    className={`dietary-picker-chip ${
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

              <div style={{ marginTop: "12px", maxWidth: "80%", marginInline: "auto" }}>
                <input
                  className="input"
                  placeholder="Anything else? (e.g., shellfish allergy)"
                  value={dietaryNote}
                  onChange={(e) => setDietaryNote(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>

              <div className="identity-dietary-actions">
                <button className="btn" onClick={handleFinish}>
                  Join potluck
                </button>
                <button
                  className="btn-ghost identity-skip-btn"
                  onClick={handleSkip}
                  type="button"
                >
                  Skip, I eat everything
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
