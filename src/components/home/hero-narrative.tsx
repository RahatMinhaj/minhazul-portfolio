"use client";

import { motion, useReducedMotion } from "motion/react";

import {
  resolveHeroParagraphs,
  splitHeroTextSegments,
} from "@/features/profile/hero-narrative";

type HeroNarrativeProps = {
  shortBio: string;
  longBio?: unknown;
  engineeringValues?: string[];
  highlightTerms?: string[];
};

export function HeroNarrative({
  shortBio,
  longBio,
  engineeringValues = [],
  highlightTerms = [],
}: HeroNarrativeProps) {
  const reduceMotion = useReducedMotion();
  const paragraphs = resolveHeroParagraphs({ longBio, shortBio });
  const values = engineeringValues.filter(Boolean);

  if (!paragraphs.length && !values.length) return null;

  return (
    <motion.aside
      animate={{ opacity: 1, y: 0 }}
      aria-label="Professional objective"
      className="hero-narrative mt-8 max-w-2xl"
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      transition={{ delay: 0.85, duration: 0.55 }}
    >
      <div className="hero-narrative-rail" aria-hidden />

      <div className="hero-narrative-inner">
        {paragraphs.length ? (
          <div className="hero-narrative-body">
            {paragraphs.map((paragraph, index) => (
              <p
                className={
                  index === 0 ? "hero-narrative-lead" : "hero-narrative-detail"
                }
                key={`${index}-${paragraph.slice(0, 24)}`}
              >
                <HighlightedText
                  highlightTerms={highlightTerms}
                  text={paragraph}
                />
              </p>
            ))}
          </div>
        ) : null}

        {values.length ? (
          <ul className="hero-narrative-values">
            {values.map((value) => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </motion.aside>
  );
}

function HighlightedText({
  text,
  highlightTerms,
}: {
  text: string;
  highlightTerms: string[];
}) {
  return (
    <>
      {splitHeroTextSegments(text, highlightTerms).map((segment, index) =>
        segment.highlighted ? (
          <mark
            className="hero-narrative-highlight"
            key={`${segment.text}-${index}`}
          >
            {segment.text}
          </mark>
        ) : (
          <span key={`${segment.text}-${index}`}>{segment.text}</span>
        ),
      )}
    </>
  );
}
