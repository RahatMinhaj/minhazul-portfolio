import type { InterviewMastery } from "@/generated/prisma/client";

export type SelectableQuestion = {
  id: string;
  mastery: InterviewMastery;
  nextReviewAt: Date | null;
  lastReviewedAt: Date | null;
  timesAsked: number;
  starred: boolean;
  confidence: number | null;
};

function weightFor(question: SelectableQuestion, now: Date) {
  let weight = 1;

  if (question.mastery === "UNKNOWN") weight += 4;
  else if (question.mastery === "WEAK") weight += 5;
  else if (question.mastery === "OK") weight += 2;
  else weight += 0.5;

  if (question.starred) weight += 1.5;
  if (question.confidence != null && question.confidence <= 2) weight += 2;
  if (question.nextReviewAt && question.nextReviewAt <= now) weight += 3;
  if (!question.lastReviewedAt) weight += 1.5;
  if (question.timesAsked === 0) weight += 1;

  return weight;
}

/** Weighted random sample without replacement. */
export function selectExamQuestions<T extends SelectableQuestion>(
  pool: T[],
  count: number,
  now = new Date(),
): T[] {
  if (count <= 0 || pool.length === 0) return [];
  const remaining = [...pool];
  const picked: T[] = [];

  while (picked.length < count && remaining.length > 0) {
    const weights = remaining.map((q) => weightFor(q, now));
    const total = weights.reduce((sum, w) => sum + w, 0);
    let cursor = Math.random() * total;
    let index = 0;
    for (; index < remaining.length; index += 1) {
      cursor -= weights[index]!;
      if (cursor <= 0) break;
    }
    if (index >= remaining.length) index = remaining.length - 1;
    picked.push(remaining[index]!);
    remaining.splice(index, 1);
  }

  return picked;
}
