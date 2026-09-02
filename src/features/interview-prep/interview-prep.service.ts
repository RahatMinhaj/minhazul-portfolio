import "server-only";

import type {
  InterviewDifficulty,
  InterviewExamMode,
  InterviewExamItemResult,
  InterviewLearningSource,
  InterviewLearningStatus,
  InterviewMastery,
  InterviewQuestionType,
} from "@/generated/prisma/client";

import { getAdminJobApplicationById } from "@/features/job-applications/job-application.repository";
import { env } from "@/config/env";
import {
  ensureLexicalJson,
  richTextToPlainText,
} from "@/lib/content/rich-text";
import { selectExamQuestions } from "./exam-selector";
import {
  generateInterviewAnswer,
  generateLearningContent,
  gradeExamAnswer,
  polishPastedAnswer,
  PROMPT_VERSION,
  structureBulkPaste,
} from "./interview-prep.generator";
import * as repository from "./interview-prep.repository";
import {
  STARTER_TOPICS,
  slugifyTopic,
  type AiProviderPreference,
} from "./interview-prep-types";
import {
  clampStructuredItems,
  heuristicSplitPaste,
  normalizeStructuredItem,
} from "./bulk-paste";
import { buildPrepCandidateContext } from "./prep-candidate-context";
import {
  masteryFromResult,
  nextReviewAfterResult,
  scoreExamResults,
} from "./spaced-repetition";

function hasAnswerContent(value: string | null | undefined) {
  if (!value?.trim()) return false;
  return richTextToPlainText(value).trim().length > 0;
}

function storeAnswerContent(value: string) {
  return ensureLexicalJson(value);
}

function escapeMinimal(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export type PrepResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; message: string };

export async function ensureStarterTopics() {
  const count = await repository.countTopics();
  if (count > 0) return;
  await repository.createTopics(
    STARTER_TOPICS.map((topic, index) => ({
      name: topic.name,
      slug: topic.slug,
      description: topic.description,
      sortOrder: index,
    })),
  );
}

export async function saveTopic(input: {
  id?: string | undefined;
  name: string;
  slug: string;
  description?: string | null | undefined;
  parentId?: string | null | undefined;
  sortOrder?: number | undefined;
  visible?: boolean | undefined;
}): Promise<PrepResult> {
  const topic = await repository.upsertTopic({
    name: input.name,
    slug: input.slug,
    ...(input.id ? { id: input.id } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.parentId !== undefined ? { parentId: input.parentId } : {}),
    ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    ...(input.visible !== undefined ? { visible: input.visible } : {}),
  });
  return { ok: true, message: input.id ? "Topic updated." : "Topic created.", id: topic.id };
}

export async function removeTopic(id: string): Promise<PrepResult> {
  await repository.deleteTopic(id);
  return { ok: true, message: "Topic deleted." };
}

export async function saveQuestion(input: {
  id?: string | undefined;
  prompt: string;
  topicId?: string | null | undefined;
  questionType?: InterviewQuestionType | undefined;
  difficulty?: InterviewDifficulty | undefined;
  tags?: string[] | undefined;
  starred?: boolean | undefined;
  answer?: string | null | undefined;
  confidence?: number | null | undefined;
  mastery?: InterviewMastery | undefined;
}): Promise<PrepResult> {
  if (input.id) {
    await repository.updateQuestion(input.id, {
      prompt: input.prompt,
      topicId: input.topicId ?? null,
      questionType: input.questionType ?? "CONCEPTUAL",
      difficulty: input.difficulty ?? "MEDIUM",
      tags: input.tags ?? [],
      starred: input.starred ?? false,
      confidence: input.confidence ?? null,
      ...(input.mastery ? { mastery: input.mastery } : {}),
    });
    if (hasAnswerContent(input.answer)) {
      await repository.createAnswerVersion({
        questionId: input.id,
        content: storeAnswerContent(input.answer!),
        generated: false,
      });
    }
    return { ok: true, message: "Question updated.", id: input.id };
  }

  const question = await repository.createQuestion({
    prompt: input.prompt,
    topicId: input.topicId ?? null,
    ...(input.questionType ? { questionType: input.questionType } : {}),
    ...(input.difficulty ? { difficulty: input.difficulty } : {}),
    ...(input.tags ? { tags: input.tags } : {}),
    ...(input.starred != null ? { starred: input.starred } : {}),
  });

  if (hasAnswerContent(input.answer)) {
    await repository.createAnswerVersion({
      questionId: question.id,
      content: storeAnswerContent(input.answer!),
      generated: false,
    });
  }

  return { ok: true, message: "Question saved.", id: question.id };
}

export async function removeQuestion(id: string): Promise<PrepResult> {
  await repository.deleteQuestion(id);
  return { ok: true, message: "Question deleted." };
}

export async function generateAndSaveAnswer(
  questionId: string,
  provider: AiProviderPreference = "auto",
  options?: {
    skipFollowUps?: boolean;
    skipGaps?: boolean;
  },
): Promise<PrepResult> {
  const question = await repository.getQuestionById(questionId);
  if (!question) return { ok: false, message: "Question not found." };

  const candidate = await buildPrepCandidateContext();
  const generation = await repository.createGeneration({
    targetType: "question",
    targetId: questionId,
    provider,
    model: "pending",
    promptVersion: PROMPT_VERSION,
    inputSnapshot: {
      prompt: question.prompt,
      questionType: question.questionType,
      difficulty: question.difficulty,
    },
    status: "RUNNING",
  });

  try {
    const result = await generateInterviewAnswer({
      prompt: question.prompt,
      questionType: question.questionType,
      difficulty: question.difficulty,
      topicName: question.topic?.name ?? null,
      candidate,
      provider,
    });

    await repository.createAnswerVersion({
      questionId,
      content: storeAnswerContent(result.answer),
      generated: true,
      provider: result.provider,
      model: result.model,
      promptVersion: PROMPT_VERSION,
    });

    if (!options?.skipGaps) {
      for (const gap of result.gaps.slice(0, 5)) {
        await repository.createLearningItem({
          title: gap,
          description: `Detected while generating answer for: ${question.prompt.slice(0, 120)}`,
          source: "AI_SCAN",
          status: "SUGGESTED",
          priority: 1,
          topicId: question.topicId,
        });
      }
    }

    if (!options?.skipFollowUps) {
      for (const followUp of result.followUps.slice(0, 3)) {
        await repository.createQuestion({
          prompt: followUp,
          topicId: question.topicId,
          questionType: question.questionType,
          difficulty: question.difficulty,
          tags: [...question.tags, "follow-up"],
          source: "ai",
          sourceRef: questionId,
        });
      }
    }

    await repository.finishGeneration(generation.id, {
      status: "COMPLETED",
      outputSnapshot: result,
    });

    return { ok: true, message: "Answer generated and saved.", id: questionId };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await repository.finishGeneration(generation.id, {
      status: "FAILED",
      errorMessage: message,
    });
    return { ok: false, message };
  }
}

export async function startExam(input: {
  mode: InterviewExamMode;
  topicIds?: string[];
  packId?: string | null;
  questionCount?: number;
  timeLimitSec?: number | null;
}): Promise<PrepResult> {
  const count = Math.min(Math.max(input.questionCount ?? 10, 1), 30);
  const topicIds = input.topicIds ?? [];
  const timeLimitSec =
    input.timeLimitSec && input.timeLimitSec > 0
      ? Math.min(input.timeLimitSec, 3 * 60 * 60)
      : null;

  if (input.mode === "PACK_FOCUS" && !input.packId) {
    return { ok: false, message: "Select a pack for pack-focus exams." };
  }

  const pool = await repository.listCandidateQuestionsForExam({
    mode: input.mode,
    topicIds,
    packId: input.packId ?? null,
  });

  if (!pool.length) {
    return {
      ok: false,
      message: "No questions available for this exam mode. Add questions first.",
    };
  }

  const selected = selectExamQuestions(pool, Math.min(count, pool.length));
  const exam = await repository.createExam({
    mode: input.mode,
    topicIds,
    packId: input.packId ?? null,
    questionCount: selected.length,
    timeLimitSec,
    items: selected.map((question, index) => ({
      questionId: question.id,
      sortOrder: index,
      promptSnapshot: question.prompt,
      expectedAnswerSnapshot: question.answers[0]?.content
        ? storeAnswerContent(question.answers[0].content)
        : "",
    })),
  });

  return { ok: true, message: "Exam started.", id: exam.id };
}

export async function submitExamAnswers(input: {
  examId: string;
  items: Array<{
    itemId: string;
    userAnswer: string;
    result?: InterviewExamItemResult | undefined;
    timeSpentSec?: number | null | undefined;
  }>;
  useAiGrading?: boolean | undefined;
  provider?: AiProviderPreference | undefined;
}): Promise<PrepResult> {
  const exam = await repository.getExamById(input.examId);
  if (!exam) return { ok: false, message: "Exam not found." };
  if (exam.status !== "IN_PROGRESS") {
    return { ok: false, message: "Exam is already closed." };
  }

  const now = new Date();
  const results: InterviewExamItemResult[] = [];
  let aiGraded = 0;

  for (const item of input.items) {
    const existing = exam.items.find((row) => row.id === item.itemId);
    if (!existing) continue;

    let result: InterviewExamItemResult = item.result ?? "SKIPPED";
    let aiFeedback: string | null = null;

    if (input.useAiGrading && item.userAnswer.trim()) {
      try {
        const graded = await gradeExamAnswer({
          prompt: existing.promptSnapshot,
          expectedAnswer:
            richTextToPlainText(existing.expectedAnswerSnapshot) ||
            existing.expectedAnswerSnapshot,
          userAnswer: item.userAnswer,
          provider: input.provider ?? "auto",
        });
        result = graded.result;
        aiFeedback = graded.feedback;
        aiGraded += 1;
      } catch {
        result = item.result ?? "PARTIAL";
        aiFeedback = "AI grading failed; used self-grade fallback.";
      }
    } else if (!item.userAnswer.trim()) {
      result = "SKIPPED";
    }

    await repository.updateExamItem(item.itemId, {
      userAnswer: item.userAnswer,
      result,
      aiFeedback,
      timeSpentSec:
        item.timeSpentSec != null && item.timeSpentSec >= 0
          ? Math.min(Math.round(item.timeSpentSec), 24 * 60 * 60)
          : null,
      selfScore:
        result === "CORRECT"
          ? 5
          : result === "PARTIAL"
            ? 3
            : result === "INCORRECT"
              ? 1
              : null,
    });
    results.push(result);

    const question = existing.question;
    const timesAsked = question.timesAsked + 1;
    const timesCorrect =
      question.timesCorrect + (result === "CORRECT" ? 1 : 0);
    const mastery = masteryFromResult(result, question.mastery);
    const nextReviewAt = nextReviewAfterResult(
      result,
      timesCorrect,
      timesAsked,
      now,
    );

    await repository.updateQuestion(question.id, {
      timesAsked,
      timesCorrect,
      mastery,
      lastReviewedAt: now,
      nextReviewAt,
    });

    if (result === "INCORRECT" || result === "PARTIAL") {
      await repository.createLearningItem({
        title: `Review: ${existing.promptSnapshot.slice(0, 100)}`,
        description: "Created from a weak exam answer.",
        source: "EXAM_WEAKNESS",
        status: "SUGGESTED",
        priority: result === "INCORRECT" ? 3 : 2,
        topicId: question.topicId,
      });
    }
  }

  const scorePct = scoreExamResults(results);
  await repository.completeExam(input.examId, scorePct);
  return {
    ok: true,
    message: input.useAiGrading
      ? `Exam completed · score ${scorePct}% · AI graded ${aiGraded} answers.`
      : `Exam completed · score ${scorePct}%.`,
    id: input.examId,
  };
}

export async function saveLearningItem(input: {
  id?: string | undefined;
  title: string;
  description?: string | null | undefined;
  source?: InterviewLearningSource | undefined;
  status?: InterviewLearningStatus | undefined;
  priority?: number | undefined;
  relatedSkillName?: string | null | undefined;
  topicId?: string | null | undefined;
}): Promise<PrepResult> {
  if (input.id) {
    await repository.updateLearningItem(input.id, {
      title: input.title,
      description: input.description ?? null,
      relatedSkillName: input.relatedSkillName ?? null,
      topicId: input.topicId ?? null,
      ...(input.source ? { source: input.source } : {}),
      ...(input.status ? { status: input.status } : {}),
      ...(input.priority != null ? { priority: input.priority } : {}),
    });
    return { ok: true, message: "Learning item updated.", id: input.id };
  }

  const item = await repository.createLearningItem({
    title: input.title,
    description: input.description ?? null,
    relatedSkillName: input.relatedSkillName ?? null,
    topicId: input.topicId ?? null,
    ...(input.source ? { source: input.source } : {}),
    ...(input.status ? { status: input.status } : {}),
    ...(input.priority != null ? { priority: input.priority } : {}),
  });
  return { ok: true, message: "Learning item created.", id: item.id };
}

export async function setLearningStatus(
  id: string,
  status: InterviewLearningStatus,
): Promise<PrepResult> {
  await repository.updateLearningItem(id, { status });
  return { ok: true, message: `Marked as ${status.toLowerCase()}.`, id };
}

export async function removeLearningItem(id: string): Promise<PrepResult> {
  await repository.deleteLearningItem(id);
  return { ok: true, message: "Learning item deleted." };
}

export async function generateLearningPack(
  learningItemId: string,
  provider: AiProviderPreference = "auto",
): Promise<PrepResult> {
  const item = await repository.getLearningItemById(learningItemId);
  if (!item) return { ok: false, message: "Learning item not found." };

  const candidate = await buildPrepCandidateContext();
  const generation = await repository.createGeneration({
    targetType: "learning",
    targetId: learningItemId,
    provider,
    model: "pending",
    promptVersion: PROMPT_VERSION,
    inputSnapshot: {
      title: item.title,
      description: item.description,
      relatedSkillName: item.relatedSkillName,
    },
    status: "RUNNING",
  });

  try {
    const pack = await generateLearningContent({
      title: item.title,
      description: item.description,
      relatedSkillName: item.relatedSkillName,
      candidate,
      provider,
    });

    if (pack.notes) {
      await repository.createLearningContent({
        learningItemId,
        kind: "NOTES",
        title: "Study notes",
        content: pack.notes,
        generated: true,
        provider: pack.provider,
        model: pack.model,
      });
    }
    if (pack.cheatsheet) {
      await repository.createLearningContent({
        learningItemId,
        kind: "CHEATSHEET",
        title: "Cheatsheet",
        content: pack.cheatsheet,
        generated: true,
        provider: pack.provider,
        model: pack.model,
      });
    }
    if (pack.projectIdea) {
      await repository.createLearningContent({
        learningItemId,
        kind: "PROJECT_IDEA",
        title: "Project idea",
        content: pack.projectIdea,
        generated: true,
        provider: pack.provider,
        model: pack.model,
      });
    }

    if (pack.practiceQuestions.length) {
      await repository.createLearningContent({
        learningItemId,
        kind: "PRACTICE_QUESTIONS",
        title: "Practice questions",
        content: pack.practiceQuestions.map((q, i) => `${i + 1}. ${q}`).join("\n"),
        generated: true,
        provider: pack.provider,
        model: pack.model,
      });

      for (const prompt of pack.practiceQuestions) {
        await repository.createQuestion({
          prompt,
          topicId: item.topicId,
          tags: item.relatedSkillName
            ? [item.relatedSkillName.toLowerCase(), "learning"]
            : ["learning"],
          source: "ai",
          sourceRef: learningItemId,
        });
      }
    }

    await repository.updateLearningItem(learningItemId, {
      status: "IN_PROGRESS",
    });

    await repository.finishGeneration(generation.id, {
      status: "COMPLETED",
      outputSnapshot: pack,
    });

    return {
      ok: true,
      message: "Learning pack generated and practice questions saved.",
      id: learningItemId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await repository.finishGeneration(generation.id, {
      status: "FAILED",
      errorMessage: message,
    });
    return { ok: false, message };
  }
}

export async function scanPortfolioGaps(): Promise<PrepResult> {
  await ensureStarterTopics();
  const skills = await repository.listLowProficiencySkills();
  let created = 0;

  for (const skill of skills) {
    const existing = await repository.findLearningBySkillName(skill.name);
    if (existing) continue;

    await repository.createLearningItem({
      title: `Strengthen ${skill.name}`,
      description: `Low or missing proficiency in ${skill.category.name}. Build interview-ready depth.`,
      source: "PORTFOLIO_GAP",
      status: "SUGGESTED",
      priority: skill.proficiency == null ? 2 : skill.proficiency < 40 ? 3 : 1,
      relatedSkillName: skill.name,
      skillId: skill.id,
    });
    created += 1;
  }

  return {
    ok: true,
    message:
      created > 0
        ? `Added ${created} learning suggestion${created === 1 ? "" : "s"} from portfolio gaps.`
        : "No new portfolio gaps found (existing suggestions already cover low-proficiency skills).",
  };
}

export async function savePack(input: {
  id?: string | undefined;
  title: string;
  companyName?: string | null | undefined;
  roleTitle?: string | null | undefined;
  notes?: string | null | undefined;
  targetDate?: Date | null | undefined;
  jobApplicationId?: string | null | undefined;
}): Promise<PrepResult> {
  if (input.id) {
    await repository.updatePack(input.id, {
      title: input.title,
      companyName: input.companyName ?? null,
      roleTitle: input.roleTitle ?? null,
      notes: input.notes ?? null,
      targetDate: input.targetDate ?? null,
      jobApplicationId: input.jobApplicationId ?? null,
    });
    return { ok: true, message: "Pack updated.", id: input.id };
  }

  const pack = await repository.createPack({
    title: input.title,
    companyName: input.companyName ?? null,
    roleTitle: input.roleTitle ?? null,
    notes: input.notes ?? null,
    targetDate: input.targetDate ?? null,
    jobApplicationId: input.jobApplicationId ?? null,
  });
  return { ok: true, message: "Pack created.", id: pack.id };
}

export async function removePack(id: string): Promise<PrepResult> {
  await repository.deletePack(id);
  return { ok: true, message: "Pack deleted." };
}

export async function addToPack(input: {
  packId: string;
  questionId: string;
  notes?: string | null;
}): Promise<PrepResult> {
  await repository.addQuestionToPack(input);
  return { ok: true, message: "Question added to pack.", id: input.packId };
}

export async function removeFromPack(
  packId: string,
  questionId: string,
): Promise<PrepResult> {
  await repository.removeQuestionFromPack(packId, questionId);
  return { ok: true, message: "Question removed from pack.", id: packId };
}

function splitArtifactLines(content: string) {
  return content
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-*•\d.)\s]+/, "").trim())
    .filter((line) => line.length >= 8);
}

export async function importFromJobApplication(
  applicationId: string,
): Promise<PrepResult> {
  await ensureStarterTopics();
  const application = await getAdminJobApplicationById(applicationId);
  if (!application) return { ok: false, message: "Job application not found." };

  const existingPack = await repository.findPackByJobApplicationId(applicationId);
  const pack =
    existingPack ??
    (await repository.createPack({
      title: `${application.companyName} · ${application.roleTitle}`,
      companyName: application.companyName,
      roleTitle: application.roleTitle,
      notes: "Imported from job application artifacts.",
      jobApplicationId: applicationId,
    }));

  const interviewPoints =
    application.artifacts.find((a) => a.kind === "interviewPoints")?.content ?? "";
  const gaps = application.artifacts.find((a) => a.kind === "gaps")?.content ?? "";

  let questionsCreated = 0;
  let learningCreated = 0;

  for (const [index, line] of splitArtifactLines(interviewPoints).entries()) {
    const existingQ = await repository.findQuestionByJobSource({
      jobApplicationId: applicationId,
      prompt: line,
    });
    if (existingQ) {
      await repository.addQuestionToPack({
        packId: pack.id,
        questionId: existingQ.id,
        sortOrder: index,
      });
      continue;
    }

    const question = await repository.createQuestion({
      prompt: line,
      questionType: "CONCEPTUAL",
      difficulty: "MEDIUM",
      tags: ["job-import", application.companyName.toLowerCase()],
      source: "job-app",
      sourceRef: applicationId,
      jobApplicationId: applicationId,
      starred: true,
    });
    await repository.addQuestionToPack({
      packId: pack.id,
      questionId: question.id,
      sortOrder: index,
    });
    questionsCreated += 1;
  }

  for (const line of splitArtifactLines(gaps)) {
    const title = line.slice(0, 200);
    const existingL = await repository.findLearningByJobGap({
      jobApplicationId: applicationId,
      title,
    });
    if (existingL) continue;

    await repository.createLearningItem({
      title,
      description: `Gap from ${application.companyName} · ${application.roleTitle}`,
      source: "JOB_GAP",
      status: "SUGGESTED",
      priority: 3,
      jobApplicationId: applicationId,
    });
    learningCreated += 1;
  }

  if (!questionsCreated && !learningCreated) {
    return {
      ok: true,
      message:
        "Already synced (or no interviewPoints/gaps artifacts). Pack is ready.",
      id: pack.id,
    };
  }

  return {
    ok: true,
    message: `Imported ${questionsCreated} interview questions and ${learningCreated} gaps into pack.`,
    id: pack.id,
  };
}

export async function bulkUpdateLibrary(input: {
  ids: string[];
  topicId?: string | null | undefined;
  addTags?: string[] | undefined;
  starred?: boolean | undefined;
  mastery?: InterviewMastery | undefined;
}): Promise<PrepResult> {
  if (!input.ids.length) return { ok: false, message: "Select at least one question." };
  const result = await repository.bulkUpdateQuestions({
    ids: input.ids,
    ...(input.topicId !== undefined ? { topicId: input.topicId } : {}),
    ...(input.addTags?.length ? { addTags: input.addTags } : {}),
    ...(input.starred != null ? { starred: input.starred } : {}),
    ...(input.mastery ? { mastery: input.mastery } : {}),
  });
  return {
    ok: true,
    message: `Updated ${result.count} question${result.count === 1 ? "" : "s"}.`,
  };
}

export async function bulkGenerateAnswers(
  ids: string[],
  provider: AiProviderPreference = "auto",
  limit = 5,
): Promise<PrepResult> {
  const targetIds =
    ids.length > 0
      ? ids.slice(0, limit)
      : await repository.listUnansweredQuestionIds(limit);

  if (!targetIds.length) {
    return { ok: false, message: "No unanswered questions to generate." };
  }

  let okCount = 0;
  const errors: string[] = [];
  for (const id of targetIds) {
    const result = await generateAndSaveAnswer(id, provider);
    if (result.ok) okCount += 1;
    else errors.push(result.message);
  }

  if (!okCount) {
    return {
      ok: false,
      message: errors[0] ?? "Bulk generation failed.",
    };
  }

  return {
    ok: true,
    message: `Generated answers for ${okCount}/${targetIds.length} questions${
      errors.length ? ` (${errors.length} failed)` : ""
    }.`,
  };
}

export function buildExportMarkdown(
  questions: Awaited<ReturnType<typeof repository.listQuestionsForExport>>,
) {
  const lines: string[] = [
    "# Interview prep export",
    "",
    `Exported ${questions.length} questions.`,
    "",
  ];

  let currentTopic = "__none__";
  for (const question of questions) {
    const topicName = question.topic?.name ?? "Uncategorized";
    if (topicName !== currentTopic) {
      currentTopic = topicName;
      lines.push(`## ${topicName}`, "");
    }
    lines.push(`### ${question.prompt}`);
    lines.push("");
    lines.push(
      `- Type: ${question.questionType} · Difficulty: ${question.difficulty} · Mastery: ${question.mastery}`,
    );
    if (question.tags.length) lines.push(`- Tags: ${question.tags.join(", ")}`);
    lines.push("");
    const answer = question.answers[0]?.content;
    if (answer) {
      lines.push(richTextToPlainText(answer) || answer);
    } else {
      lines.push("_No answer yet._");
    }
    lines.push("", "---", "");
  }

  return lines.join("\n");
}

export async function exportLibraryMarkdown(params?: {
  topicId?: string | null;
  packId?: string | null;
}) {
  const questions = await repository.listQuestionsForExport(params);
  return buildExportMarkdown(questions);
}

function csvEscape(value: string) {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildExportCsv(
  questions: Awaited<ReturnType<typeof repository.listQuestionsForExport>>,
) {
  const header = [
    "id",
    "topic",
    "prompt",
    "questionType",
    "difficulty",
    "mastery",
    "tags",
    "starred",
    "hasAnswer",
    "answer",
  ];
  const rows = questions.map((question) => [
    question.id,
    question.topic?.name ?? "",
    question.prompt,
    question.questionType,
    question.difficulty,
    question.mastery,
    question.tags.join("|"),
    question.starred ? "1" : "0",
    question.answers[0] ? "1" : "0",
    question.answers[0]?.content
      ? richTextToPlainText(question.answers[0].content) || question.answers[0].content
      : "",
  ]);

  return [header, ...rows]
    .map((cols) => cols.map((c) => csvEscape(String(c))).join(","))
    .join("\n");
}

export async function exportLibraryCsv(params?: {
  topicId?: string | null;
  packId?: string | null;
}) {
  const questions = await repository.listQuestionsForExport(params);
  return buildExportCsv(questions);
}

export async function syncAllJobApplicationGaps(): Promise<PrepResult> {
  await ensureStarterTopics();
  const apps = await repository.listJobApplicationsWithGaps(30);
  const targets = apps.filter((app) => app.needsSync);
  if (!targets.length) {
    return {
      ok: true,
      message: apps.length
        ? "All job applications with gaps are already synced."
        : "No job applications with gap artifacts found.",
    };
  }

  let synced = 0;
  let learningCreated = 0;
  for (const app of targets) {
    const result = await importFromJobApplication(app.id);
    if (result.ok) {
      synced += 1;
      const match = result.message.match(/(\d+) gaps/);
      if (match) learningCreated += Number(match[1]);
    }
  }

  return {
    ok: true,
    message: `Synced ${synced} application${synced === 1 ? "" : "s"} needing updates${
      learningCreated ? ` (${learningCreated} new gaps)` : ""
    }.`,
  };
}

export async function promoteLearningToSkill(input: {
  learningItemId: string;
  categoryId: string;
  skillName?: string | null;
  proficiency?: number | null;
}): Promise<PrepResult> {
  const item = await repository.getLearningItemById(input.learningItemId);
  if (!item) return { ok: false, message: "Learning item not found." };

  const name = (input.skillName?.trim() || item.relatedSkillName || item.title).trim();
  if (name.length < 2) return { ok: false, message: "Skill name is required." };

  const existing = await repository.findSkillByName(name);
  if (existing) {
    await repository.updateLearningItem(input.learningItemId, {
      skillId: existing.id,
      relatedSkillName: existing.name,
      status: "DONE",
    });
    return {
      ok: true,
      message: `Linked to existing skill "${existing.name}" (hidden skills stay as-is).`,
      id: existing.id,
    };
  }

  const baseSlug = slugifyTopic(name) || `skill-${Date.now()}`;
  let slug = baseSlug;
  let attempt = 0;
  while (attempt < 5) {
    try {
      const skill = await repository.createDraftSkill({
        name,
        slug,
        categoryId: input.categoryId,
        proficiency: input.proficiency ?? 20,
      });
      await repository.updateLearningItem(input.learningItemId, {
        skillId: skill.id,
        relatedSkillName: skill.name,
        status: "DONE",
      });
      return {
        ok: true,
        message: `Created draft skill "${skill.name}" (visible=false). Review in Skills.`,
        id: skill.id,
      };
    } catch {
      attempt += 1;
      slug = `${baseSlug}-${attempt + 1}`;
    }
  }

  return { ok: false, message: "Could not create a unique skill slug." };
}

const BULK_PASTE_MAX_ITEMS = 25;
const BULK_GENERATE_MAX = 15;
/** Inline OpenRouter/Gemini prompts above this use file upload when Gemini is configured. */
const BULK_PASTE_INLINE_AI_THRESHOLD = 120_000;

export async function importBulkPaste(input: {
  richHtml: string;
  plainText: string;
  defaultTopicId?: string | null;
  generateMissingAnswers?: boolean;
  polishExistingAnswers?: boolean;
  provider?: AiProviderPreference;
}): Promise<PrepResult> {
  await ensureStarterTopics();
  const richHtml = input.richHtml.trim();
  const plainPaste = input.plainText.trim() || richTextToPlainText(richHtml).trim();
  if (plainPaste.length < 8) {
    return { ok: false, message: "Paste at least one question (8+ characters)." };
  }

  const provider = input.provider ?? "auto";
  const topics = await repository.listTopics();
  const topicBySlug = new Map(topics.map((t) => [t.slug, t.id]));
  const topicByName = new Map(
    topics.map((t) => [t.name.trim().toLowerCase(), t.id]),
  );

  let items: ReturnType<typeof clampStructuredItems> = [];
  let aiNote: string | null = null;

  const canTryAiStructure =
    richHtml.length <= BULK_PASTE_INLINE_AI_THRESHOLD || Boolean(env.GEMINI_API_KEY);

  if (canTryAiStructure) {
    try {
      const structured = await structureBulkPaste({
        richHtml: richHtml || `<p>${escapeMinimal(plainPaste)}</p>`,
        plainText: plainPaste,
        topicSlugs: topics.map((t) => t.slug),
        provider,
      });

      items = clampStructuredItems(
        structured.items
          .map((row) => normalizeStructuredItem(row as Record<string, unknown>))
          .filter((row): row is NonNullable<typeof row> => Boolean(row)),
        BULK_PASTE_MAX_ITEMS,
      );

      if (structured.provider === "gemini" && richHtml.length > 4_000) {
        aiNote = "structured via Gemini HTML upload";
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn("Bulk paste AI structure failed; using heuristic split.", message);
      aiNote = `AI skipped (${message.slice(0, 120)})`;
    }
  }

  // Fallback if AI returned nothing useful
  if (!items.length) {
    items = clampStructuredItems(
      heuristicSplitPaste(plainPaste).map((row) =>
        normalizeStructuredItem({
          prompt: row.prompt,
          answer: row.answer,
          questionType: "CONCEPTUAL",
          difficulty: "MEDIUM",
          tags: ["bulk-paste"],
          topicSlug: null,
        }),
      ).filter((row): row is NonNullable<typeof row> => Boolean(row)),
      BULK_PASTE_MAX_ITEMS,
    );
  }

  if (!items.length) {
    return { ok: false, message: "Could not extract any questions from the paste." };
  }

  const candidate = await buildPrepCandidateContext();
  let created = 0;
  let skipped = 0;
  let withPastedAnswers = 0;
  const needGenerate: string[] = [];

  for (const item of items) {
    const existing = await repository.findQuestionByPrompt(item.prompt);
    if (existing) {
      skipped += 1;
      continue;
    }

    let topicId =
      (item.topicSlug ? topicBySlug.get(item.topicSlug) : undefined) ??
      (item.topicSlug ? topicByName.get(item.topicSlug) : undefined) ??
      input.defaultTopicId ??
      null;

    // Auto-create topic if AI invented a reasonable slug not in DB
    if (!topicId && item.topicSlug && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.topicSlug)) {
      const createdTopic = await repository.upsertTopic({
        name: item.topicSlug
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
        slug: item.topicSlug,
        description: "Auto-created from bulk paste",
        sortOrder: topics.length + created,
        visible: true,
      });
      topicId = createdTopic.id;
      topicBySlug.set(createdTopic.slug, createdTopic.id);
    }

    const question = await repository.createQuestion({
      prompt: item.prompt,
      topicId,
      questionType: item.questionType,
      difficulty: item.difficulty,
      tags: [...new Set(["bulk-paste", ...item.tags])],
      source: "bulk-paste",
    });
    created += 1;

    if (item.answer) {
      let answerContent = item.answer;
      if (input.polishExistingAnswers !== false) {
        try {
          const polished = await polishPastedAnswer({
            prompt: item.prompt,
            answer: item.answer,
            candidate,
            provider,
          });
          answerContent = polished.answer;
          await repository.createAnswerVersion({
            questionId: question.id,
            content: storeAnswerContent(answerContent),
            generated: true,
            provider: polished.provider,
            model: polished.model,
            promptVersion: PROMPT_VERSION,
          });
        } catch {
          await repository.createAnswerVersion({
            questionId: question.id,
            content: storeAnswerContent(answerContent),
            generated: false,
          });
        }
      } else {
        await repository.createAnswerVersion({
          questionId: question.id,
          content: storeAnswerContent(answerContent),
          generated: false,
        });
      }
      withPastedAnswers += 1;
    } else if (input.generateMissingAnswers !== false) {
      needGenerate.push(question.id);
    }
  }

  let generated = 0;
  let generateFailed = 0;
  for (const id of needGenerate.slice(0, BULK_GENERATE_MAX)) {
    const result = await generateAndSaveAnswer(id, provider, {
      skipFollowUps: true,
      skipGaps: true,
    });
    if (result.ok) generated += 1;
    else generateFailed += 1;
  }

  const remaining = Math.max(0, needGenerate.length - BULK_GENERATE_MAX);

  return {
    ok: true,
    message: [
      `Saved ${created} question${created === 1 ? "" : "s"}`,
      aiNote,
      skipped ? `${skipped} duplicate skipped` : null,
      withPastedAnswers ? `${withPastedAnswers} with pasted answers` : null,
      generated ? `${generated} answers generated` : null,
      generateFailed ? `${generateFailed} generate failed` : null,
      remaining ? `${remaining} still need answers (run bulk generate)` : null,
    ]
      .filter(Boolean)
      .join(" · "),
  };
}

