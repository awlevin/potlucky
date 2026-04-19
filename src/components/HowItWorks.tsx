"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const steps = [
  {
    emoji: "📝",
    title: "Start a Potluck",
    description:
      "Create a potluck in one click. Give it a fun name or keep the random one.",
  },
  {
    emoji: "👯",
    title: "Share & Claim",
    description:
      "Send the link to friends. Everyone picks the dish they're bringing.",
  },
  {
    emoji: "🍽️",
    title: "Enjoy the Feast",
    description:
      "Show up hungry. Every dish is accounted for — no duplicate salads.",
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
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.li
      ref={ref}
      className="how-step"
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{
        duration: 0.6,
        delay: index * 0.18,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      <article className="how-step-card">
        <span className="how-step-bignum" aria-hidden="true">
          {index + 1}
        </span>

        <div className="how-step-seal" aria-hidden="true">
          <span className="how-step-seal-emoji">{step.emoji}</span>
        </div>

        <div className="how-step-eyebrow">
          Step <em>{["One", "Two", "Three"][index]}</em>
        </div>

        <h3 className="how-step-title">{step.title}</h3>

        <div className="how-step-divider" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <p className="how-step-desc">{step.description}</p>
      </article>
    </motion.li>
  );
}

export default function HowItWorks() {
  return (
    <section className="how-section">
      <div className="how-rule how-rule-top" aria-hidden="true" />

      <div className="how-container">
        <motion.div
          className="how-eyebrow"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
        >
          <span className="how-eyebrow-mark" />
          <span>The Ritual</span>
          <span className="how-eyebrow-mark" />
        </motion.div>

        <motion.h2
          className="how-heading"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          How it <em>works</em>
        </motion.h2>

        <motion.p
          className="how-subheading"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          Three steps. One feast. Zero spreadsheets.
        </motion.p>

        <ol className="how-steps">
          {steps.map((step, index) => (
            <StepCard key={step.title} step={step} index={index} />
          ))}
        </ol>
      </div>

      <div className="how-rule how-rule-bottom" aria-hidden="true" />
    </section>
  );
}
