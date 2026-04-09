"use client";

import { useState } from "react";
import { User } from "@/types";
import { AnimatePresence, motion } from "framer-motion";

interface IdentityGateProps {
  users: User[];
  onSelectExisting: (user: User) => void;
  onCreateNew: (name: string) => void;
}

export function IdentityGate({
  users,
  onSelectExisting,
  onCreateNew,
}: IdentityGateProps) {
  const [showNewInput, setShowNewInput] = useState(false);
  const [newName, setNewName] = useState("");

  const handleSubmitNew = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    onCreateNew(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmitNew();
    }
  };

  return (
    <div className="identity-overlay">
      <motion.div
        className="card identity-card"
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
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
          Who are you?
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "var(--color-text-muted)",
            fontSize: "0.875rem",
            marginBottom: "1.5rem",
          }}
        >
          Pick your name so we know who&apos;s bringing what.
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
                  onClick={handleSubmitNew}
                  disabled={!newName.trim()}
                >
                  Join
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
