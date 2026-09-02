import { z } from "zod";

import { richTextToHtml, richTextToPlainText } from "@/lib/content/rich-text";
import {
  INTERVIEW_DIFFICULTIES,
  INTERVIEW_EXAM_MODES,
  INTERVIEW_EXAM_RESULTS,
  INTERVIEW_LEARNING_SOURCES,
  INTERVIEW_LEARNING_STATUSES,
  INTERVIEW_MASTERIES,
  INTERVIEW_QUESTION_TYPES,
} from "@/features/interview-prep/interview-prep-types";

export const topicSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(500).optional().nullable(),
  parentId: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  visible: z.boolean().default(true),
});

export const questionSchema = z.object({
  id: z.string().optional(),
  prompt: z.string().trim().min(5).max(5000),
  topicId: z.string().optional().nullable(),
  questionType: z.enum(INTERVIEW_QUESTION_TYPES).default("CONCEPTUAL"),
  difficulty: z.enum(INTERVIEW_DIFFICULTIES).default("MEDIUM"),
  tags: z.array(z.string().trim().min(1)).default([]),
  starred: z.boolean().default(false),
  answer: z.string().trim().max(1_000_000).optional().nullable(),
  confidence: z.coerce.number().int().min(1).max(5).optional().nullable(),
  mastery: z.enum(INTERVIEW_MASTERIES).optional(),
});

export const startExamSchema = z.object({
  mode: z.enum(INTERVIEW_EXAM_MODES).default("RANDOM"),
  topicIds: z.array(z.string()).default([]),
  packId: z.string().optional().nullable(),
  questionCount: z.coerce.number().int().min(1).max(30).default(10),
  timeLimitSec: z.coerce.number().int().min(0).max(10800).optional().nullable(),
});

export const examItemGradeSchema = z.object({
  itemId: z.string().min(1),
  userAnswer: z.string().max(20000).default(""),
  result: z.enum(INTERVIEW_EXAM_RESULTS).optional(),
  timeSpentSec: z.coerce.number().int().min(0).max(86400).optional(),
});

export const learningItemSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().max(2000).optional().nullable(),
  source: z.enum(INTERVIEW_LEARNING_SOURCES).default("MANUAL"),
  status: z.enum(INTERVIEW_LEARNING_STATUSES).default("SUGGESTED"),
  priority: z.coerce.number().int().min(0).max(10).default(0),
  relatedSkillName: z.string().trim().max(120).optional().nullable(),
  topicId: z.string().optional().nullable(),
});

export const packSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2).max(200),
  companyName: z.string().trim().max(200).optional().nullable(),
  roleTitle: z.string().trim().max(200).optional().nullable(),
  notes: z.string().trim().max(5000).optional().nullable(),
  targetDate: z.string().optional().nullable(),
  jobApplicationId: z.string().optional().nullable(),
});

export const bulkQuestionsSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
  topicId: z.string().optional().nullable(),
  addTags: z.array(z.string().trim().min(1)).default([]),
  starred: z.boolean().optional(),
  mastery: z.enum(INTERVIEW_MASTERIES).optional(),
});

export const promoteSkillSchema = z.object({
  learningItemId: z.string().min(1),
  categoryId: z.string().min(1),
  skillName: z.string().trim().max(120).optional().nullable(),
  proficiency: z.coerce.number().int().min(0).max(100).optional().nullable(),
});

export const bulkPasteSchema = z.object({
  rawText: z.preprocess(
    (value) => (value == null ? "" : String(value)),
    z.string().max(10_000_000),
  ),
  defaultTopicId: z.string().optional().nullable(),
  generateMissingAnswers: z.boolean().default(true),
  polishExistingAnswers: z.boolean().default(true),
});

export function bulkPastePlainText(rawText: string) {
  return richTextToPlainText(rawText).trim() || rawText.trim();
}

/** Lexical / HTML / plain → HTML for AI (keeps structure, not stripped to .txt). */
export function bulkPasteRichHtml(rawText: string) {
  const html = richTextToHtml(rawText).trim();
  if (html) return html;
  const plain = bulkPastePlainText(rawText);
  if (!plain) return "";
  return plain
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtmlAttr(p).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

function escapeHtmlAttr(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function validateBulkPastePlainText(plainText: string):
  | { ok: true }
  | { ok: false; message: string } {
  if (plainText.length < 8) {
    return {
      ok: false,
      message: "Paste at least one question (8+ characters of text).",
    };
  }
  if (plainText.length > 500_000) {
    return {
      ok: false,
      message:
        "Paste is very large (500k+ characters). Split into 2–3 smaller batches.",
    };
  }
  return { ok: true };
}
