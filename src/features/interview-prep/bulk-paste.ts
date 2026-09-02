import type {
  InterviewDifficulty,
  InterviewQuestionType,
} from "@/generated/prisma/client";

import {
  INTERVIEW_DIFFICULTIES,
  INTERVIEW_QUESTION_TYPES,
  isInterviewDifficulty,
  isInterviewQuestionType,
} from "./interview-prep-types";

export type StructuredPasteItem = {
  prompt: string;
  answer: string | null;
  topicSlug: string | null;
  questionType: InterviewQuestionType;
  difficulty: InterviewDifficulty;
  tags: string[];
};

/** Fast local split before AI structuring — handles numbered lists and Q:/A: blocks. */
export function heuristicSplitPaste(raw: string): Array<{ prompt: string; answer: string | null }> {
  const text = raw.replace(/\r\n/g, "\n").trim();
  if (!text) return [];

  // Prefer Q:/A: or Question:/Answer: blocks
  const qaBlocks = text.split(
    /(?=^(?:Q(?:uestion)?|Prompt)\s*[:.)-]\s*)/gim,
  ).filter((b) => b.trim().length > 0);

  if (qaBlocks.length >= 2 || /^(?:Q(?:uestion)?|Prompt)\s*[:.)-]/im.test(text)) {
    return qaBlocks
      .map((block) => {
        const cleaned = block.trim();
        const answerMatch = cleaned.match(
          /\n\s*(?:A(?:nswer)?|Ans)\s*[:.)-]\s*([\s\S]+)$/i,
        );
        const promptPart = answerMatch
          ? cleaned.slice(0, answerMatch.index).trim()
          : cleaned;
        const prompt = promptPart
          .replace(/^(?:Q(?:uestion)?|Prompt)\s*[:.)-]\s*/i, "")
          .trim();
        const answer = answerMatch?.[1]?.trim() || null;
        return prompt.length >= 5 ? { prompt, answer } : null;
      })
      .filter((item): item is { prompt: string; answer: string | null } => Boolean(item));
  }

  // Numbered / bulleted lines
  const numbered = text
    .split(/\n+/)
    .map((line) => line.replace(/^\s*(?:\d+[.)]|[-*•])\s+/, "").trim())
    .filter((line) => line.length >= 5);

  if (numbered.length >= 2 && numbered.length <= 40) {
    // If blank-line separated paragraphs look better, prefer those
    const paragraphs = text
      .split(/\n\s*\n/)
      .map((p) => p.replace(/^\s*(?:\d+[.)]|[-*•])\s+/gm, "").trim())
      .filter((p) => p.length >= 5);

    const useParagraphs =
      paragraphs.length >= 2 &&
      paragraphs.length < numbered.length &&
      paragraphs.some((p) => p.includes("\n") || p.length > 80);

    const items = useParagraphs ? paragraphs : numbered;
    return items.map((prompt) => {
      const answerMatch = prompt.match(
        /\n\s*(?:A(?:nswer)?|Ans)\s*[:.)-]\s*([\s\S]+)$/i,
      );
      if (!answerMatch) return { prompt, answer: null };
      return {
        prompt: prompt.slice(0, answerMatch.index).trim(),
        answer: answerMatch[1]?.trim() || null,
      };
    });
  }

  // Single blob / paragraphs
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length >= 5);

  if (paragraphs.length >= 2) {
    return paragraphs.map((prompt) => ({ prompt, answer: null }));
  }

  return [{ prompt: text, answer: null }];
}

export function normalizeStructuredItem(raw: Record<string, unknown>): StructuredPasteItem | null {
  const prompt = String(raw.prompt ?? "").trim();
  if (prompt.length < 5) return null;

  const answerRaw = String(raw.answer ?? "").trim();
  const questionTypeRaw = String(raw.questionType ?? "CONCEPTUAL").toUpperCase();
  const difficultyRaw = String(raw.difficulty ?? "MEDIUM").toUpperCase();
  const topicSlugRaw = String(raw.topicSlug ?? "").trim().toLowerCase();
  const tags = Array.isArray(raw.tags)
    ? raw.tags.map(String).map((t) => t.trim().toLowerCase()).filter(Boolean).slice(0, 8)
    : [];

  return {
    prompt: prompt.slice(0, 5000),
    answer: answerRaw.length >= 8 ? answerRaw.slice(0, 50000) : null,
    topicSlug: topicSlugRaw || null,
    questionType: isInterviewQuestionType(questionTypeRaw)
      ? questionTypeRaw
      : "CONCEPTUAL",
    difficulty: isInterviewDifficulty(difficultyRaw) ? difficultyRaw : "MEDIUM",
    tags,
  };
}

export function clampStructuredItems(items: StructuredPasteItem[], max = 25) {
  return items.slice(0, max);
}

export const STRUCTURE_ENUM_HINT = {
  questionTypes: INTERVIEW_QUESTION_TYPES,
  difficulties: INTERVIEW_DIFFICULTIES,
};
