"use server";

import { revalidatePath } from "next/cache";

import {
  addToPack,
  bulkGenerateAnswers,
  bulkUpdateLibrary,
  ensureStarterTopics,
  generateAndSaveAnswer,
  generateLearningPack,
  importBulkPaste,
  importFromJobApplication,
  promoteLearningToSkill,
  removeFromPack,
  removeLearningItem,
  removePack,
  removeQuestion,
  removeTopic,
  saveLearningItem,
  savePack,
  saveQuestion,
  saveTopic,
  scanPortfolioGaps,
  setLearningStatus,
  startExam,
  submitExamAnswers,
  syncAllJobApplicationGaps,
} from "@/features/interview-prep/interview-prep.service";
import {
  isInterviewExamResult,
  isInterviewLearningStatus,
  isInterviewMastery,
  parseAiProviderPreference,
  slugifyTopic,
} from "@/features/interview-prep/interview-prep-types";
import { requireAdmin } from "@/lib/auth/session";
import {
  bulkPastePlainText,
  bulkPasteRichHtml,
  bulkPasteSchema,
  bulkQuestionsSchema,
  examItemGradeSchema,
  learningItemSchema,
  packSchema,
  promoteSkillSchema,
  questionSchema,
  startExamSchema,
  topicSchema,
  validateBulkPastePlainText,
} from "@/lib/validation/interview-prep";
import {
  failure,
  idSchema,
  parseOptionalDate,
  readStringList,
  success,
} from "@/server/actions/action-helpers";
import type { ActionState } from "@/types/action-state";

const PREP_PATHS = [
  "/admin/interview-prep",
  "/admin/interview-prep/library",
  "/admin/interview-prep/topics",
  "/admin/interview-prep/exams",
  "/admin/interview-prep/learning",
  "/admin/interview-prep/packs",
  "/admin/interview-prep/analytics",
] as const;

function revalidatePrep(extra?: string) {
  for (const path of PREP_PATHS) revalidatePath(path);
  if (extra) revalidatePath(extra);
}

function readAiProvider(formData: FormData) {
  const preference = parseAiProviderPreference(formData.get("aiProvider"));
  if (!preference) {
    return { ok: false as const, message: "Select an AI provider." };
  }
  return { ok: true as const, preference };
}

export async function saveTopicAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  await ensureStarterTopics();

  const name = String(formData.get("name") ?? "").trim();
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const parsed = topicSchema.safeParse({
    id: String(formData.get("id") ?? "") || undefined,
    name,
    slug: slugRaw || slugifyTopic(name),
    description: String(formData.get("description") ?? "") || null,
    parentId: String(formData.get("parentId") ?? "") || null,
    sortOrder: formData.get("sortOrder") ?? 0,
    visible: formData.get("visible") === "on",
  });
  if (!parsed.success) return failure("Topic validation failed.");

  const result = await saveTopic({
    name: parsed.data.name,
    slug: parsed.data.slug,
    sortOrder: parsed.data.sortOrder,
    visible: parsed.data.visible,
    ...(parsed.data.id ? { id: parsed.data.id } : {}),
    ...(parsed.data.description !== undefined
      ? { description: parsed.data.description }
      : {}),
    ...(parsed.data.parentId !== undefined ? { parentId: parsed.data.parentId } : {}),
  });
  if (!result.ok) return failure(result.message);
  revalidatePrep();
  return success(result.message, result.id ? { id: result.id } : undefined);
}

export async function deleteTopicAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return failure("Invalid topic ID.");
  const result = await removeTopic(id.data);
  if (!result.ok) return failure(result.message);
  revalidatePrep();
  return success(result.message);
}

export async function saveQuestionAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  await ensureStarterTopics();

  const parsed = questionSchema.safeParse({
    id: String(formData.get("id") ?? "") || undefined,
    prompt: formData.get("prompt"),
    topicId: String(formData.get("topicId") ?? "") || null,
    questionType: formData.get("questionType") || "CONCEPTUAL",
    difficulty: formData.get("difficulty") || "MEDIUM",
    tags: readStringList(formData.get("tags")),
    starred: formData.get("starred") === "on",
    answer: String(formData.get("answer") ?? "") || null,
    confidence: formData.get("confidence") || null,
    mastery: formData.get("mastery") || undefined,
  });
  if (!parsed.success) return failure("Question validation failed.");

  const result = await saveQuestion({
    prompt: parsed.data.prompt,
    questionType: parsed.data.questionType,
    difficulty: parsed.data.difficulty,
    tags: parsed.data.tags,
    starred: parsed.data.starred,
    ...(parsed.data.id ? { id: parsed.data.id } : {}),
    ...(parsed.data.topicId !== undefined ? { topicId: parsed.data.topicId } : {}),
    ...(parsed.data.answer !== undefined ? { answer: parsed.data.answer } : {}),
    ...(parsed.data.confidence !== undefined
      ? { confidence: parsed.data.confidence }
      : {}),
    ...(parsed.data.mastery ? { mastery: parsed.data.mastery } : {}),
  });
  if (!result.ok) return failure(result.message);
  revalidatePrep(result.id ? `/admin/interview-prep/library/${result.id}` : undefined);
  return success(result.message, result.id ? { id: result.id } : undefined);
}

export async function importBulkPasteAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  await ensureStarterTopics();

  const provider = readAiProvider(formData);
  if (!provider.ok) return failure(provider.message);

  const parsed = bulkPasteSchema.safeParse({
    rawText: formData.get("rawText"),
    defaultTopicId: String(formData.get("defaultTopicId") ?? "") || null,
    generateMissingAnswers: formData.get("generateMissingAnswers") === "on",
    polishExistingAnswers: formData.get("polishExistingAnswers") === "on",
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (issue?.code === "too_big") {
      return failure(
        "Paste payload is too large for one upload. Split into smaller batches.",
      );
    }
    return failure("Paste validation failed — add content in the editor first.");
  }

  const plainPaste = bulkPastePlainText(parsed.data.rawText);
  const richHtml = bulkPasteRichHtml(parsed.data.rawText);
  const plainCheck = validateBulkPastePlainText(plainPaste);
  if (!plainCheck.ok) return failure(plainCheck.message);

  try {
    const result = await importBulkPaste({
      richHtml,
      plainText: plainPaste,
      generateMissingAnswers: parsed.data.generateMissingAnswers,
      polishExistingAnswers: parsed.data.polishExistingAnswers,
      provider: provider.preference,
      ...(parsed.data.defaultTopicId
        ? { defaultTopicId: parsed.data.defaultTopicId }
        : {}),
    });
    if (!result.ok) return failure(result.message);
    revalidatePrep();
    return success(result.message);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return failure(message);
  }
}

export async function deleteQuestionAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return failure("Invalid question ID.");
  const result = await removeQuestion(id.data);
  if (!result.ok) return failure(result.message);
  revalidatePrep();
  return success(result.message);
}

export async function generateAnswerAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return failure("Invalid question ID.");
  const provider = readAiProvider(formData);
  if (!provider.ok) return failure(provider.message);

  try {
    const result = await generateAndSaveAnswer(id.data, provider.preference);
    if (!result.ok) return failure(result.message);
    revalidatePrep(`/admin/interview-prep/library/${id.data}`);
    revalidatePath("/admin/interview-prep/learning");
    return success(result.message);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return failure(`Answer generation failed: ${message}`);
  }
}

export async function startExamAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  await ensureStarterTopics();

  const topicIds = formData.getAll("topicIds").map(String).filter(Boolean);
  const packId = String(formData.get("packId") ?? "") || null;
  const timeLimitMinutes = Number(formData.get("timeLimitMinutes") ?? 0);
  const parsed = startExamSchema.safeParse({
    mode: formData.get("mode") || "RANDOM",
    topicIds,
    packId,
    questionCount: formData.get("questionCount") || 10,
    timeLimitSec: timeLimitMinutes > 0 ? Math.round(timeLimitMinutes * 60) : null,
  });
  if (!parsed.success) return failure("Exam configuration invalid.");

  const result = await startExam({
    mode: parsed.data.mode,
    topicIds: parsed.data.topicIds,
    questionCount: parsed.data.questionCount,
    timeLimitSec: parsed.data.timeLimitSec ?? null,
    ...(parsed.data.packId ? { packId: parsed.data.packId } : {}),
  });
  if (!result.ok) return failure(result.message);
  revalidatePrep();
  return success(result.message, result.id ? { id: result.id } : undefined);
}

export async function submitExamAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const examId = idSchema.safeParse(formData.get("examId"));
  if (!examId.success) return failure("Invalid exam ID.");

  const useAiGrading = formData.get("useAiGrading") === "on";
  const provider = useAiGrading ? readAiProvider(formData) : null;
  if (useAiGrading && provider && !provider.ok) return failure(provider.message);

  const itemIds = formData.getAll("itemId").map(String);
  const items = itemIds.map((itemId) => {
    const resultRaw = String(formData.get(`result_${itemId}`) ?? "");
    const timeRaw = Number(formData.get(`timeSpent_${itemId}`) ?? "");
    return examItemGradeSchema.parse({
      itemId,
      userAnswer: String(formData.get(`answer_${itemId}`) ?? ""),
      ...(isInterviewExamResult(resultRaw) ? { result: resultRaw } : {}),
      ...(Number.isFinite(timeRaw) && timeRaw >= 0
        ? { timeSpentSec: Math.round(timeRaw) }
        : {}),
    });
  });

  try {
    const result = await submitExamAnswers({
      examId: examId.data,
      items: items.map((item) => ({
        itemId: item.itemId,
        userAnswer: item.userAnswer,
        ...(item.result ? { result: item.result } : {}),
        ...(item.timeSpentSec != null ? { timeSpentSec: item.timeSpentSec } : {}),
      })),
      useAiGrading,
      ...(useAiGrading && provider && provider.ok
        ? { provider: provider.preference }
        : {}),
    });
    if (!result.ok) return failure(result.message);
    revalidatePrep(`/admin/interview-prep/exams/${examId.data}`);
    revalidatePath("/admin/interview-prep/learning");
    return success(result.message);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return failure(`Exam submit failed: ${message}`);
  }
}

export async function saveLearningItemAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = learningItemSchema.safeParse({
    id: String(formData.get("id") ?? "") || undefined,
    title: formData.get("title"),
    description: String(formData.get("description") ?? "") || null,
    source: formData.get("source") || "MANUAL",
    status: formData.get("status") || "SUGGESTED",
    priority: formData.get("priority") || 0,
    relatedSkillName: String(formData.get("relatedSkillName") ?? "") || null,
    topicId: String(formData.get("topicId") ?? "") || null,
  });
  if (!parsed.success) return failure("Learning item validation failed.");

  const result = await saveLearningItem({
    title: parsed.data.title,
    source: parsed.data.source,
    status: parsed.data.status,
    priority: parsed.data.priority,
    ...(parsed.data.id ? { id: parsed.data.id } : {}),
    ...(parsed.data.description !== undefined
      ? { description: parsed.data.description }
      : {}),
    ...(parsed.data.relatedSkillName !== undefined
      ? { relatedSkillName: parsed.data.relatedSkillName }
      : {}),
    ...(parsed.data.topicId !== undefined ? { topicId: parsed.data.topicId } : {}),
  });
  if (!result.ok) return failure(result.message);
  revalidatePrep(result.id ? `/admin/interview-prep/learning/${result.id}` : undefined);
  return success(result.message, result.id ? { id: result.id } : undefined);
}

export async function setLearningStatusAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return failure("Invalid learning item ID.");
  const status = String(formData.get("status") ?? "");
  if (!isInterviewLearningStatus(status)) return failure("Invalid status.");

  const result = await setLearningStatus(id.data, status);
  if (!result.ok) return failure(result.message);
  revalidatePrep(`/admin/interview-prep/learning/${id.data}`);
  return success(result.message);
}

export async function deleteLearningItemAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return failure("Invalid learning item ID.");
  const result = await removeLearningItem(id.data);
  if (!result.ok) return failure(result.message);
  revalidatePrep();
  return success(result.message);
}

export async function generateLearningPackAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return failure("Invalid learning item ID.");
  const provider = readAiProvider(formData);
  if (!provider.ok) return failure(provider.message);

  try {
    const result = await generateLearningPack(id.data, provider.preference);
    if (!result.ok) return failure(result.message);
    revalidatePrep(`/admin/interview-prep/learning/${id.data}`);
    revalidatePath("/admin/interview-prep/library");
    return success(result.message);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return failure(`Learning generation failed: ${message}`);
  }
}

export async function scanPortfolioGapsAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  void formData;
  const result = await scanPortfolioGaps();
  if (!result.ok) return failure(result.message);
  revalidatePrep();
  return success(result.message);
}

export async function savePackAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = packSchema.safeParse({
    id: String(formData.get("id") ?? "") || undefined,
    title: formData.get("title"),
    companyName: String(formData.get("companyName") ?? "") || null,
    roleTitle: String(formData.get("roleTitle") ?? "") || null,
    notes: String(formData.get("notes") ?? "") || null,
    targetDate: String(formData.get("targetDate") ?? "") || null,
    jobApplicationId: String(formData.get("jobApplicationId") ?? "") || null,
  });
  if (!parsed.success) return failure("Pack validation failed.");

  const result = await savePack({
    title: parsed.data.title,
    companyName: parsed.data.companyName ?? null,
    roleTitle: parsed.data.roleTitle ?? null,
    notes: parsed.data.notes ?? null,
    targetDate: parseOptionalDate(parsed.data.targetDate ?? null),
    jobApplicationId: parsed.data.jobApplicationId ?? null,
    ...(parsed.data.id ? { id: parsed.data.id } : {}),
  });
  if (!result.ok) return failure(result.message);
  revalidatePrep(result.id ? `/admin/interview-prep/packs/${result.id}` : undefined);
  return success(result.message, result.id ? { id: result.id } : undefined);
}

export async function deletePackAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) return failure("Invalid pack ID.");
  const result = await removePack(id.data);
  if (!result.ok) return failure(result.message);
  revalidatePrep();
  return success(result.message);
}

export async function addQuestionToPackAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const packId = idSchema.safeParse(formData.get("packId"));
  const questionId = idSchema.safeParse(formData.get("questionId"));
  if (!packId.success || !questionId.success) {
    return failure("Invalid pack or question ID.");
  }
  const result = await addToPack({
    packId: packId.data,
    questionId: questionId.data,
    notes: String(formData.get("notes") ?? "") || null,
  });
  if (!result.ok) return failure(result.message);
  revalidatePrep(`/admin/interview-prep/packs/${packId.data}`);
  return success(result.message);
}

export async function removeQuestionFromPackAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const packId = idSchema.safeParse(formData.get("packId"));
  const questionId = idSchema.safeParse(formData.get("questionId"));
  if (!packId.success || !questionId.success) {
    return failure("Invalid pack or question ID.");
  }
  const result = await removeFromPack(packId.data, questionId.data);
  if (!result.ok) return failure(result.message);
  revalidatePrep(`/admin/interview-prep/packs/${packId.data}`);
  return success(result.message);
}

export async function importJobApplicationAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("applicationId"));
  if (!id.success) return failure("Invalid application ID.");

  try {
    const result = await importFromJobApplication(id.data);
    if (!result.ok) return failure(result.message);
    revalidatePrep(result.id ? `/admin/interview-prep/packs/${result.id}` : undefined);
    revalidatePath("/admin/interview-prep/library");
    revalidatePath("/admin/interview-prep/learning");
    return success(result.message, result.id ? { id: result.id } : undefined);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return failure(`Import failed: ${message}`);
  }
}

export async function bulkUpdateQuestionsAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const ids = formData.getAll("ids").map(String).filter(Boolean);
  const masteryRaw = String(formData.get("mastery") ?? "");
  const starredRaw = String(formData.get("starred") ?? "");
  const parsed = bulkQuestionsSchema.safeParse({
    ids,
    topicId: String(formData.get("topicId") ?? "") || null,
    addTags: readStringList(formData.get("addTags")),
    ...(starredRaw === "true"
      ? { starred: true }
      : starredRaw === "false"
        ? { starred: false }
        : {}),
    ...(isInterviewMastery(masteryRaw) ? { mastery: masteryRaw } : {}),
  });
  if (!parsed.success) return failure("Select questions and a valid bulk action.");

  const result = await bulkUpdateLibrary({
    ids: parsed.data.ids,
    topicId: parsed.data.topicId ?? null,
    addTags: parsed.data.addTags,
    ...(parsed.data.starred != null ? { starred: parsed.data.starred } : {}),
    ...(parsed.data.mastery ? { mastery: parsed.data.mastery } : {}),
  });
  if (!result.ok) return failure(result.message);
  revalidatePrep();
  return success(result.message);
}

export async function bulkGenerateAnswersAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const provider = readAiProvider(formData);
  if (!provider.ok) return failure(provider.message);
  const ids = formData.getAll("ids").map(String).filter(Boolean);
  const limit = Math.min(Math.max(Number(formData.get("limit") ?? 5) || 5, 1), 10);

  try {
    const result = await bulkGenerateAnswers(ids, provider.preference, limit);
    if (!result.ok) return failure(result.message);
    revalidatePrep();
    revalidatePath("/admin/interview-prep/learning");
    return success(result.message);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return failure(`Bulk generate failed: ${message}`);
  }
}

export async function promoteLearningToSkillAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  const parsed = promoteSkillSchema.safeParse({
    learningItemId: formData.get("learningItemId"),
    categoryId: formData.get("categoryId"),
    skillName: String(formData.get("skillName") ?? "") || null,
    proficiency: formData.get("proficiency") || 20,
  });
  if (!parsed.success) return failure("Skill promotion validation failed.");

  const result = await promoteLearningToSkill({
    learningItemId: parsed.data.learningItemId,
    categoryId: parsed.data.categoryId,
    skillName: parsed.data.skillName ?? null,
    proficiency: parsed.data.proficiency ?? 20,
  });
  if (!result.ok) return failure(result.message);
  revalidatePrep(`/admin/interview-prep/learning/${parsed.data.learningItemId}`);
  revalidatePath("/admin/skills");
  revalidatePath("/skills");
  return success(result.message, result.id ? { id: result.id } : undefined);
}

export async function syncAllJobGapsAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  void formData;
  try {
    const result = await syncAllJobApplicationGaps();
    if (!result.ok) return failure(result.message);
    revalidatePrep();
    revalidatePath("/admin/interview-prep/analytics");
    revalidatePath("/admin/interview-prep/learning");
    revalidatePath("/admin/interview-prep/packs");
    return success(result.message);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return failure(`Job gap sync failed: ${message}`);
  }
}

