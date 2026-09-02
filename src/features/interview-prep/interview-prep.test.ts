import { describe, expect, it } from "vitest";

import {
  clampStructuredItems,
  heuristicSplitPaste,
  normalizeStructuredItem,
} from "./bulk-paste";
import { selectExamQuestions } from "./exam-selector";
import {
  masteryFromResult,
  nextReviewAfterResult,
  scoreExamResults,
} from "./spaced-repetition";

describe("selectExamQuestions", () => {
  it("picks up to the requested count", () => {
    const pool = Array.from({ length: 8 }, (_, i) => ({
      id: `q${i}`,
      mastery: i < 3 ? ("WEAK" as const) : ("STRONG" as const),
      nextReviewAt: null,
      lastReviewedAt: null,
      timesAsked: 0,
      starred: false,
      confidence: null,
    }));

    const picked = selectExamQuestions(pool, 5);
    expect(picked).toHaveLength(5);
    expect(new Set(picked.map((q) => q.id)).size).toBe(5);
  });
});

describe("spaced repetition helpers", () => {
  it("scores mixed results", () => {
    expect(scoreExamResults(["CORRECT", "PARTIAL", "INCORRECT"])).toBe(50);
  });

  it("moves weak answers toward WEAK mastery", () => {
    expect(masteryFromResult("INCORRECT", "OK")).toBe("WEAK");
  });

  it("schedules a near-term review after an incorrect answer", () => {
    const now = new Date("2026-08-25T00:00:00.000Z");
    const next = nextReviewAfterResult("INCORRECT", 0, 1, now);
    expect(next.toISOString()).toBe("2026-08-26T00:00:00.000Z");
  });
});

describe("bulk paste heuristics", () => {
  it("splits Q:/A: blocks", () => {
    const items = heuristicSplitPaste(`
Q: What is SSR?
A: Server renders HTML.

Q: What is CSR?
A: Browser renders with JS.
`);
    expect(items).toHaveLength(2);
    expect(items[0]?.prompt).toBe("What is SSR?");
    expect(items[0]?.answer).toContain("Server renders");
    expect(items[1]?.prompt).toBe("What is CSR?");
  });

  it("splits numbered question-only lists", () => {
    const items = heuristicSplitPaste(`1. Explain event loop
2. Design a rate limiter
3. Tell me about a production outage`);
    expect(items).toHaveLength(3);
    expect(items.every((item) => item.answer === null)).toBe(true);
  });

  it("normalizes structured AI rows", () => {
    const item = normalizeStructuredItem({
      prompt: "  How does JWT auth work?  ",
      answer: "Access tokens are short-lived.",
      topicSlug: "Security",
      questionType: "conceptual",
      difficulty: "hard",
      tags: ["auth", "jwt", ""],
    });
    expect(item).toMatchObject({
      prompt: "How does JWT auth work?",
      topicSlug: "security",
      questionType: "CONCEPTUAL",
      difficulty: "HARD",
      tags: ["auth", "jwt"],
    });
  });

  it("clamps to max items", () => {
    const items = Array.from({ length: 30 }, (_, i) => ({
      prompt: `Question ${i}`,
      answer: null,
      topicSlug: null,
      questionType: "CONCEPTUAL" as const,
      difficulty: "MEDIUM" as const,
      tags: [],
    }));
    expect(clampStructuredItems(items, 25)).toHaveLength(25);
  });
});
