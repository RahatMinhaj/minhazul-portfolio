import type {
  InterviewDifficulty,
  InterviewExamMode,
  InterviewExamItemResult,
  InterviewLearningSource,
  InterviewLearningStatus,
  InterviewMastery,
  InterviewQuestionType,
} from "@/generated/prisma/client";
import type { AiProviderPreference } from "@/lib/ai/text-completion";
import { parseAiProviderPreference as parseJobAiProvider } from "@/features/job-applications/job-application-types";

export type { AiProviderPreference };

export const INTERVIEW_DIFFICULTIES = [
  "EASY",
  "MEDIUM",
  "HARD",
] as const satisfies readonly InterviewDifficulty[];

export const INTERVIEW_QUESTION_TYPES = [
  "CONCEPTUAL",
  "BEHAVIORAL",
  "SYSTEM_DESIGN",
  "CODING",
  "DEBUGGING",
  "PORTFOLIO_WALKTHROUGH",
] as const satisfies readonly InterviewQuestionType[];

export const INTERVIEW_MASTERIES = [
  "UNKNOWN",
  "WEAK",
  "OK",
  "STRONG",
] as const satisfies readonly InterviewMastery[];

export const INTERVIEW_EXAM_MODES = [
  "RANDOM",
  "WEAK_FOCUS",
  "TOPIC_FOCUS",
  "PACK_FOCUS",
  "DUE_FOCUS",
] as const satisfies readonly InterviewExamMode[];

export const INTERVIEW_EXAM_RESULTS = [
  "UNANSWERED",
  "CORRECT",
  "PARTIAL",
  "INCORRECT",
  "SKIPPED",
] as const satisfies readonly InterviewExamItemResult[];

export const INTERVIEW_LEARNING_STATUSES = [
  "SUGGESTED",
  "ACCEPTED",
  "IN_PROGRESS",
  "DONE",
  "DISMISSED",
] as const satisfies readonly InterviewLearningStatus[];

export const INTERVIEW_LEARNING_SOURCES = [
  "PORTFOLIO_GAP",
  "JOB_GAP",
  "MANUAL",
  "EXAM_WEAKNESS",
  "AI_SCAN",
] as const satisfies readonly InterviewLearningSource[];

export const QUESTION_TYPE_LABELS: Record<InterviewQuestionType, string> = {
  CONCEPTUAL: "Conceptual",
  BEHAVIORAL: "Behavioral",
  SYSTEM_DESIGN: "System design",
  CODING: "Coding",
  DEBUGGING: "Debugging",
  PORTFOLIO_WALKTHROUGH: "Portfolio walkthrough",
};

export const MASTERY_LABELS: Record<InterviewMastery, string> = {
  UNKNOWN: "Unknown",
  WEAK: "Weak",
  OK: "OK",
  STRONG: "Strong",
};

export const EXAM_MODE_LABELS: Record<InterviewExamMode, string> = {
  RANDOM: "Random (weak-weighted)",
  WEAK_FOCUS: "Weak focus",
  TOPIC_FOCUS: "Topic focus",
  PACK_FOCUS: "Pack focus",
  DUE_FOCUS: "Due for review",
};

export const STARTER_TOPICS = [
  { name: "Backend", slug: "backend", description: "APIs, services, NestJS, Java, auth, data." },
  { name: "Frontend", slug: "frontend", description: "React, Next.js, UI state, performance." },
  { name: "System Design", slug: "system-design", description: "Scalability, trade-offs, architecture." },
  { name: "Behavioral", slug: "behavioral", description: "Leadership, conflict, ownership stories." },
  {
    name: "Portfolio Walkthrough",
    slug: "portfolio-walkthrough",
    description: "Explain your projects, decisions, and outcomes.",
  },
  { name: "Databases", slug: "databases", description: "SQL, Postgres, indexing, transactions." },
  { name: "Cloud & DevOps", slug: "cloud-devops", description: "Deploy, CI/CD, containers, observability." },
] as const;

export function parseAiProviderPreference(value: unknown): AiProviderPreference | null {
  return parseJobAiProvider(value);
}

export function isInterviewDifficulty(value: string): value is InterviewDifficulty {
  return (INTERVIEW_DIFFICULTIES as readonly string[]).includes(value);
}

export function isInterviewQuestionType(value: string): value is InterviewQuestionType {
  return (INTERVIEW_QUESTION_TYPES as readonly string[]).includes(value);
}

export function isInterviewMastery(value: string): value is InterviewMastery {
  return (INTERVIEW_MASTERIES as readonly string[]).includes(value);
}

export function isInterviewExamMode(value: string): value is InterviewExamMode {
  return (INTERVIEW_EXAM_MODES as readonly string[]).includes(value);
}

export function isInterviewExamResult(value: string): value is InterviewExamItemResult {
  return (INTERVIEW_EXAM_RESULTS as readonly string[]).includes(value);
}

export function isInterviewLearningStatus(value: string): value is InterviewLearningStatus {
  return (INTERVIEW_LEARNING_STATUSES as readonly string[]).includes(value);
}

export function slugifyTopic(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
