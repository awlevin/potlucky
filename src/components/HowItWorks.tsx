"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const steps = [
  {
    emoji: "📝",
    number: "1",
    title: "Start a Potluck",
    description:
      "Create a potluck in one click. Give it a fun name or keep the random one!",
  },
  {
    emoji: "👯",
    number: "2",
    title: "Share & Claim Dishes",
    description:
      "Share the link with friends. Everyone picks what they're bringing.",
  },
  {
    emoji: "🍽️",
    number: "3",
    title: "Enjoy the Feast",
    description:
      "Show up hungry. Every dish is accounted for — no duplicate salads!",
  },
];

function StepCard({
  step,
  index,
}: {
  step: (typeof steps)[number];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      style={{ opacity: isInView ? undefined : 0 }}
    >
      <div className="step-card">
        <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>
          {step.emoji}
        </div>
        <div className="step-number">
          {step.number}
        </div>
        <p
          style={{
            fontFamily: "var(--font-fraunces), Georgia, serif",
            fontWeight: 500,
            fontSize: "1.125rem",
            marginBottom: "8px",
            color: "var(--color-text)",
          }}
        >
          {step.title}
        </p>
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--color-text-secondary)",
            lineHeight: 1.6,
          }}
        >
          {step.description}
        </p>
      </div>
    </motion.div>
  );
}

export default function HowItWorks() {
  return (
    <div style={{ padding: "64px 16px" }}>
      <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
        <h2
          className="display-heading"
          style={{
            textAlign: "center",
            fontSize: "1.5rem",
            marginBottom: "12px",
          }}
        >
          How It Works
        </h2>
        <div
          style={{
            width: "48px",
            height: "2px",
            background: "var(--color-brand)",
            margin: "4px auto 40px",
          }}
        />
        <div className="steps-grid">
          {steps.map((step, index) => (
            <StepCard key={step.number} step={step} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
