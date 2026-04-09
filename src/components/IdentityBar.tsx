"use client";

import { User } from "@/types";

interface IdentityBarProps {
  user: User;
  onSwitch: () => void;
}

export function IdentityBar({ user, onSwitch }: IdentityBarProps) {
  return (
    <div className="identity-bar">
      <span style={{ fontSize: "0.875rem" }}>
        You&apos;re{" "}
        <strong style={{ fontWeight: 600 }}>{user.name}</strong>{" "}
        <span role="img" aria-label="wave">
          👋
        </span>
      </span>
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
    </div>
  );
}
