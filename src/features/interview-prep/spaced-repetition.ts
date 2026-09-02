import type { InterviewExamItemResult, InterviewMastery } from "@/generated/prisma/client";

const RESULT_TO_QUALITY: Record<InterviewExamItemResult, number> = {
  CORRECT: 5,
  PARTIAL: 3,
  INCORRECT: 1,
  SKIPPED: 2,
  UNANSWERED: 1,
};

const MASTERY_FROM_QUALITY: Array<{ min: number; mastery: InterviewMastery }> = [
  { min: 4.5, mastery: "STRONG" },
  { min: 3.2, mastery: "OK" },
  { min: 2, mastery: "WEAK" },
  { min: 0, mastery: "UNKNOWN" },
];

/** Lightweight SM-2-style interval from self/AI grade. */
export function nextReviewAfterResult(
  result: InterviewExamItemResult,
  timesCorrect: number,
  timesAsked: number,
  now = new Date(),
) {
  const quality = RESULT_TO_QUALITY[result];
  const accuracy = timesAsked > 0 ? timesCorrect / timesAsked : 0;
  let intervalDays = 1;

  if (quality >= 5) {
    intervalDays = Math.min(30, Math.max(3, Math.round(2 + accuracy * 10)));
  } else if (quality >= 3) {
    intervalDays = Math.min(14, Math.max(2, Math.round(1 + accuracy * 5)));
  } else {
    intervalDays = 1;
  }

  const next = new Date(now);
  next.setUTCDate(next.getUTCDate() + intervalDays);
  return next;
}

export function masteryFromResult(
  result: InterviewExamItemResult,
  previous: InterviewMastery,
): InterviewMastery {
  if (result === "SKIPPED" || result === "UNANSWERED") return previous;

  const quality = RESULT_TO_QUALITY[result];
  const blended =
    previous === "STRONG"
      ? (quality + 4.5) / 2
      : previous === "OK"
        ? (quality + 3.5) / 2
        : previous === "WEAK"
          ? (quality + 2) / 2
          : quality;

  for (const row of MASTERY_FROM_QUALITY) {
    if (blended >= row.min) return row.mastery;
  }
  return "UNKNOWN";
}

export function scoreExamResults(results: InterviewExamItemResult[]) {
  if (!results.length) return 0;
  const points = results.reduce((sum, result) => {
    if (result === "CORRECT") return sum + 1;
    if (result === "PARTIAL") return sum + 0.5;
    return sum;
  }, 0);
  return Math.round((points / results.length) * 1000) / 10;
}
