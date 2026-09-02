import "server-only";

import {
  extractJsonObject,
  stripCodeFences,
} from "@/features/job-applications/job-application-parse";
import { completeGeminiHtmlFilePrompt } from "@/lib/ai/gemini-file-completion";
import { env } from "@/config/env";
import {
  completeTextPrompt,
  type AiProviderPreference,
} from "@/lib/ai/text-completion";
import type { InterviewExamItemResult } from "@/generated/prisma/client";
import {
  prepCandidateContextToPlainText,
  type PrepCandidateContext,
} from "./prep-candidate-context";

export const PROMPT_VERSION = "v2";

const COMPLETION = {
  maxOutputTokens: 4096,
  temperature: 0.35,
  timeoutMs: 60_000,
} as const;

const GRADE_COMPLETION = {
  maxOutputTokens: 1024,
  temperature: 0.2,
  timeoutMs: 45_000,
} as const;

export type GeneratedAnswer = {
  answer: string;
  followUps: string[];
  gaps: string[];
  provider: string;
  model: string;
};

export type GeneratedLearningPack = {
  notes: string;
  cheatsheet: string;
  practiceQuestions: string[];
  projectIdea: string;
  provider: string;
  model: string;
};

export type GradedExamAnswer = {
  result: InterviewExamItemResult;
  feedback: string;
  provider: string;
  model: string;
};

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function parseGradeResult(value: unknown): InterviewExamItemResult {
  const raw = String(value ?? "").toUpperCase();
  if (raw === "CORRECT" || raw === "PARTIAL" || raw === "INCORRECT") return raw;
  return "PARTIAL";
}

export async function generateInterviewAnswer(params: {
  prompt: string;
  questionType: string;
  difficulty: string;
  topicName?: string | null;
  candidate: PrepCandidateContext;
  provider?: AiProviderPreference;
}): Promise<GeneratedAnswer> {
  const candidateText = prepCandidateContextToPlainText(params.candidate);
  const systemPrompt = [
    "You are an interview coach for a software engineer preparing answers.",
    "Use the candidate profile as the ONLY source of personal facts. Never invent employers, projects, metrics, or skills.",
    "If the profile lacks evidence for a claim, put that in gaps and keep the answer honest.",
    "Prefer concrete examples from the candidate's projects/experience when available.",
    "Write the main answer in first person, as the candidate would speak in an interview.",
    "Return JSON with exact keys:",
    '{"answer":"html answer with short sections using h2/h3/p/ul/li/strong/code: hook, core explanation, personal example if available, pitfalls","followUps":["likely follow-up questions"],"gaps":["missing evidence or skills to learn"]}',
    "",
    `Question type: ${params.questionType}`,
    `Difficulty: ${params.difficulty}`,
    params.topicName ? `Topic: ${params.topicName}` : "",
    "",
    "=== CANDIDATE PROFILE ===",
    candidateText,
    "",
    "=== INTERVIEW QUESTION ===",
    params.prompt,
  ]
    .filter(Boolean)
    .join("\n");

  const completion = await completeTextPrompt(
    systemPrompt,
    COMPLETION,
    params.provider ?? "auto",
    { openRouterTitle: "Interview Prep", logLabel: "Interview prep answer" },
  );

  const parsed = extractJsonObject(completion.text);
  if (!parsed) {
    return {
      answer: stripCodeFences(completion.text),
      followUps: [],
      gaps: [],
      provider: completion.provider,
      model: completion.model,
    };
  }

  return {
    answer: String(parsed.answer ?? stripCodeFences(completion.text)),
    followUps: asStringArray(parsed.followUps),
    gaps: asStringArray(parsed.gaps),
    provider: completion.provider,
    model: completion.model,
  };
}

export async function generateLearningContent(params: {
  title: string;
  description?: string | null;
  relatedSkillName?: string | null;
  candidate: PrepCandidateContext;
  provider?: AiProviderPreference;
}): Promise<GeneratedLearningPack> {
  const candidateText = prepCandidateContextToPlainText(params.candidate);
  const systemPrompt = [
    "You are building a focused interview learning pack for a software engineer.",
    "Be practical and interview-oriented. Do not invent portfolio experience.",
    "If the topic is new to the candidate, frame notes as what to learn and how to talk about it honestly.",
    "Return JSON with exact keys:",
    '{"notes":"markdown study notes","cheatsheet":"short markdown cheatsheet","practiceQuestions":["3-6 interview questions"],"projectIdea":"one small project idea to build evidence"}',
    "",
    `Learning title: ${params.title}`,
    params.description ? `Context: ${params.description}` : "",
    params.relatedSkillName ? `Skill focus: ${params.relatedSkillName}` : "",
    "",
    "=== CANDIDATE PROFILE ===",
    candidateText,
  ]
    .filter(Boolean)
    .join("\n");

  const completion = await completeTextPrompt(
    systemPrompt,
    COMPLETION,
    params.provider ?? "auto",
    { openRouterTitle: "Interview Prep Learning", logLabel: "Interview prep learning" },
  );

  const parsed = extractJsonObject(completion.text);
  if (!parsed) {
    const fallback = stripCodeFences(completion.text);
    return {
      notes: fallback,
      cheatsheet: "",
      practiceQuestions: [],
      projectIdea: "",
      provider: completion.provider,
      model: completion.model,
    };
  }

  return {
    notes: String(parsed.notes ?? ""),
    cheatsheet: String(parsed.cheatsheet ?? ""),
    practiceQuestions: asStringArray(parsed.practiceQuestions),
    projectIdea: String(parsed.projectIdea ?? ""),
    provider: completion.provider,
    model: completion.model,
  };
}

export async function gradeExamAnswer(params: {
  prompt: string;
  expectedAnswer: string;
  userAnswer: string;
  provider?: AiProviderPreference;
}): Promise<GradedExamAnswer> {
  if (!params.userAnswer.trim()) {
    return {
      result: "SKIPPED",
      feedback: "No answer provided.",
      provider: "none",
      model: "none",
    };
  }

  const systemPrompt = [
    "You are grading a software interview practice answer.",
    "Compare the candidate answer to the reference answer and the question.",
    "Be fair: reward correct concepts even if wording differs. Penalize invented claims not supported by the reference.",
    "Return JSON with exact keys:",
    '{"result":"CORRECT|PARTIAL|INCORRECT","feedback":"2-4 sentences of coaching feedback"}',
    "",
    "=== QUESTION ===",
    params.prompt,
    "",
    "=== REFERENCE ANSWER ===",
    params.expectedAnswer || "(none)",
    "",
    "=== CANDIDATE ANSWER ===",
    params.userAnswer,
  ].join("\n");

  const completion = await completeTextPrompt(
    systemPrompt,
    GRADE_COMPLETION,
    params.provider ?? "auto",
    { openRouterTitle: "Interview Prep Grading", logLabel: "Interview prep grade" },
  );

  const parsed = extractJsonObject(completion.text);
  return {
    result: parseGradeResult(parsed?.result),
    feedback: String(parsed?.feedback ?? stripCodeFences(completion.text)).slice(0, 2000),
    provider: completion.provider,
    model: completion.model,
  };
}

const STRUCTURE_COMPLETION = {
  maxOutputTokens: 8192,
  temperature: 0.2,
  timeoutMs: 120_000,
} as const;

/** Above this size, send paste via Gemini Files API instead of inline prompt text. */
const BULK_STRUCTURE_FILE_THRESHOLD = 4_000;

export type StructuredBulkItem = {
  prompt: string;
  answer: string | null;
  topicSlug: string | null;
  questionType: string;
  difficulty: string;
  tags: string[];
};

export async function structureBulkPaste(params: {
  /** Rich HTML from the editor — preserves headings, lists, emphasis, etc. */
  richHtml: string;
  /** Plain text fallback for heuristic split when AI is unavailable. */
  plainText: string;
  topicSlugs: string[];
  provider?: AiProviderPreference;
}): Promise<{
  items: StructuredBulkItem[];
  provider: string;
  model: string;
}> {
  const instructions = [
    "You structure messy interview-prep paste dumps into clean database records.",
    "Do NOT invent portfolio facts. Do NOT dump the raw paste as one blob.",
    "The paste is rich HTML. Use structure (headings, lists, bold, paragraphs, Q/A labels) as signals to split questions and preserve answer formatting.",
    "Split into distinct interview questions. Clean wording. Infer topicSlug from the allowed list when possible.",
    "If the paste already includes an answer for a question, put it in answer as cleaned HTML (p/ul/li/strong/em/code/pre/h2/h3). Keep meaningful formatting from the source. Otherwise answer=null.",
    "Do not generate full interview answers here — only preserve answers that already exist in the paste.",
    "Return JSON only:",
    '{"items":[{"prompt":"clean question","answer":"html answer or null","topicSlug":"one of allowed slugs or null","questionType":"CONCEPTUAL|BEHAVIORAL|SYSTEM_DESIGN|CODING|DEBUGGING|PORTFOLIO_WALKTHROUGH","difficulty":"EASY|MEDIUM|HARD","tags":["short","tags"]}]}',
    "Max 25 items. Merge near-duplicates. Drop noise/headers.",
    "",
    "=== ALLOWED TOPIC SLUGS ===",
    params.topicSlugs.join(", ") || "(none)",
  ].join("\n");

  const richHtml = params.richHtml.trim();
  const provider = params.provider ?? "auto";
  const useGeminiFile =
    richHtml.length > BULK_STRUCTURE_FILE_THRESHOLD && Boolean(env.GEMINI_API_KEY);

  let completion: Awaited<ReturnType<typeof completeTextPrompt>>;

  if (useGeminiFile) {
    completion = await completeGeminiHtmlFilePrompt(
      [
        instructions,
        "",
        "The full rich-text paste is attached as an HTML document (text/html).",
        "Read the entire document. Preserve structural cues (headings, lists, bold, Q/A blocks).",
      ].join("\n"),
      wrapPasteHtmlDocument(richHtml),
      STRUCTURE_COMPLETION,
      "Interview prep bulk structure (HTML)",
    );
  } else if (
    richHtml.length > BULK_STRUCTURE_FILE_THRESHOLD &&
    !env.GEMINI_API_KEY
  ) {
    throw new Error(
      "Large rich paste needs Gemini HTML upload. Set GEMINI_API_KEY or use a smaller batch.",
    );
  } else {
    completion = await completeTextPrompt(
      [
        instructions,
        "",
        "=== PASTE DUMP (HTML) ===",
        richHtml.slice(0, 120_000),
      ].join("\n"),
      STRUCTURE_COMPLETION,
      provider,
      { openRouterTitle: "Interview Prep Bulk Import", logLabel: "Interview prep bulk structure" },
    );
  }

  const parsed = extractJsonObject(completion.text);
  const rawItems = Array.isArray(parsed?.items) ? parsed.items : [];
  const items: StructuredBulkItem[] = rawItems
    .filter((row): row is Record<string, unknown> => Boolean(row) && typeof row === "object")
    .map((row) => ({
      prompt: String(row.prompt ?? "").trim(),
      answer: row.answer == null || row.answer === ""
        ? null
        : String(row.answer).trim(),
      topicSlug: row.topicSlug ? String(row.topicSlug).trim().toLowerCase() : null,
      questionType: String(row.questionType ?? "CONCEPTUAL"),
      difficulty: String(row.difficulty ?? "MEDIUM"),
      tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    }))
    .filter((item) => item.prompt.length >= 5)
    .slice(0, 25);

  return {
    items,
    provider: completion.provider,
    model: completion.model,
  };
}

function wrapPasteHtmlDocument(bodyHtml: string) {
  return [
    "<!DOCTYPE html>",
    '<html lang="en"><head><meta charset="utf-8" />',
    "<title>Interview prep paste</title></head><body>",
    bodyHtml,
    "</body></html>",
  ].join("");
}

/** Polish a pasted answer into clean interview markdown without inventing facts. */
export async function polishPastedAnswer(params: {
  prompt: string;
  answer: string;
  candidate: PrepCandidateContext;
  provider?: AiProviderPreference;
}): Promise<{ answer: string; provider: string; model: string }> {
  const candidateText = prepCandidateContextToPlainText(params.candidate);
  const systemPrompt = [
    "Polish this interview answer into clear structured HTML for later study.",
    "Keep the author's meaning. Use candidate profile only to tighten examples that are already implied — never invent employers/projects/metrics.",
    "Prefer HTML tags: h2, h3, p, ul, ol, li, strong, em, code, pre. No markdown fences.",
    "Return JSON: {\"answer\":\"polished html\"}",
    "",
    "=== CANDIDATE PROFILE ===",
    candidateText,
    "",
    "=== QUESTION ===",
    params.prompt,
    "",
    "=== DRAFT ANSWER ===",
    params.answer,
  ].join("\n");

  const completion = await completeTextPrompt(
    systemPrompt,
    COMPLETION,
    params.provider ?? "auto",
    { openRouterTitle: "Interview Prep Polish", logLabel: "Interview prep polish" },
  );
  const parsed = extractJsonObject(completion.text);
  return {
    answer: String(parsed?.answer ?? stripCodeFences(completion.text)),
    provider: completion.provider,
    model: completion.model,
  };
}
