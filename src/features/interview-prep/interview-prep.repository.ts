import "server-only";

import type {
  InterviewDifficulty,
  InterviewExamMode,
  InterviewExamItemResult,
  InterviewLearningSource,
  InterviewLearningStatus,
  InterviewMastery,
  InterviewQuestionType,
  Prisma,
} from "@/generated/prisma/client";

import { getDatabase } from "@/lib/db/client";

export async function countTopics() {
  const db = getDatabase();
  return db.interviewTopic.count();
}

export async function createTopics(
  topics: Array<{
    name: string;
    slug: string;
    description?: string;
    sortOrder: number;
  }>,
) {
  const db = getDatabase();
  await db.interviewTopic.createMany({ data: topics, skipDuplicates: true });
}

export async function listTopics() {
  const db = getDatabase();
  return db.interviewTopic.findMany({
    where: { visible: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: { select: { questions: true } },
    },
  });
}

export async function getTopicById(id: string) {
  const db = getDatabase();
  return db.interviewTopic.findUnique({ where: { id } });
}

export async function upsertTopic(data: {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: string | null;
  sortOrder?: number;
  visible?: boolean;
}) {
  const db = getDatabase();
  if (data.id) {
    return db.interviewTopic.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        parentId: data.parentId ?? null,
        sortOrder: data.sortOrder ?? 0,
        visible: data.visible ?? true,
      },
    });
  }
  return db.interviewTopic.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      parentId: data.parentId ?? null,
      sortOrder: data.sortOrder ?? 0,
      visible: data.visible ?? true,
    },
  });
}

export async function deleteTopic(id: string) {
  const db = getDatabase();
  return db.interviewTopic.delete({ where: { id } });
}

export type QuestionListFilters = {
  search?: string | undefined;
  topicId?: string | undefined;
  mastery?: InterviewMastery | undefined;
  difficulty?: InterviewDifficulty | undefined;
  questionType?: InterviewQuestionType | undefined;
  starred?: boolean | undefined;
  needsAnswer?: boolean | undefined;
  page: number;
  pageSize: number;
};

export async function listQuestions(filters: QuestionListFilters) {
  const db = getDatabase();
  const where: Prisma.InterviewQuestionWhereInput = {};

  if (filters.topicId) where.topicId = filters.topicId;
  if (filters.mastery) where.mastery = filters.mastery;
  if (filters.difficulty) where.difficulty = filters.difficulty;
  if (filters.questionType) where.questionType = filters.questionType;
  if (filters.starred) where.starred = true;
  if (filters.search) {
    where.OR = [
      { prompt: { contains: filters.search, mode: "insensitive" } },
      { tags: { has: filters.search } },
    ];
  }
  if (filters.needsAnswer) {
    where.answers = { none: { isCurrent: true } };
  }

  const [questions, total] = await Promise.all([
    db.interviewQuestion.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
      include: {
        topic: true,
        answers: {
          where: { isCurrent: true },
          take: 1,
        },
      },
    }),
    db.interviewQuestion.count({ where }),
  ]);

  return { questions, total, page: filters.page, pageSize: filters.pageSize };
}

export async function getQuestionById(id: string) {
  const db = getDatabase();
  return db.interviewQuestion.findUnique({
    where: { id },
    include: {
      topic: true,
      answers: { orderBy: { version: "desc" } },
    },
  });
}

export async function createQuestion(data: {
  prompt: string;
  topicId?: string | null;
  questionType?: InterviewQuestionType;
  difficulty?: InterviewDifficulty;
  tags?: string[];
  source?: string;
  sourceRef?: string | null;
  starred?: boolean;
  relatedSkillId?: string | null;
  relatedProjectId?: string | null;
  jobApplicationId?: string | null;
}) {
  const db = getDatabase();
  return db.interviewQuestion.create({
    data: {
      prompt: data.prompt,
      topicId: data.topicId ?? null,
      questionType: data.questionType ?? "CONCEPTUAL",
      difficulty: data.difficulty ?? "MEDIUM",
      tags: data.tags ?? [],
      source: data.source ?? "manual",
      sourceRef: data.sourceRef ?? null,
      starred: data.starred ?? false,
      relatedSkillId: data.relatedSkillId ?? null,
      relatedProjectId: data.relatedProjectId ?? null,
      jobApplicationId: data.jobApplicationId ?? null,
    },
  });
}

export async function updateQuestion(
  id: string,
  data: Prisma.InterviewQuestionUncheckedUpdateInput,
) {
  const db = getDatabase();
  return db.interviewQuestion.update({ where: { id }, data });
}

export async function deleteQuestion(id: string) {
  const db = getDatabase();
  return db.interviewQuestion.delete({ where: { id } });
}

export async function createAnswerVersion(data: {
  questionId: string;
  content: string;
  generated?: boolean;
  provider?: string | null;
  model?: string | null;
  promptVersion?: string | null;
}) {
  const db = getDatabase();
  const latest = await db.interviewAnswer.findFirst({
    where: { questionId: data.questionId },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  const version = (latest?.version ?? 0) + 1;

  await db.interviewAnswer.updateMany({
    where: { questionId: data.questionId, isCurrent: true },
    data: { isCurrent: false },
  });

  return db.interviewAnswer.create({
    data: {
      questionId: data.questionId,
      content: data.content,
      version,
      isCurrent: true,
      generated: data.generated ?? false,
      provider: data.provider ?? null,
      model: data.model ?? null,
      promptVersion: data.promptVersion ?? null,
    },
  });
}

export async function listCandidateQuestionsForExam(params: {
  mode: InterviewExamMode;
  topicIds: string[];
  packId?: string | null;
  limitPool?: number;
}) {
  const db = getDatabase();
  const where: Prisma.InterviewQuestionWhereInput = {};
  const now = new Date();

  if (params.mode === "TOPIC_FOCUS" && params.topicIds.length) {
    where.topicId = { in: params.topicIds };
  }
  if (params.mode === "WEAK_FOCUS") {
    where.mastery = { in: ["UNKNOWN", "WEAK"] };
  }
  if (params.mode === "DUE_FOCUS") {
    where.nextReviewAt = { lte: now };
  }
  if (params.mode === "PACK_FOCUS" && params.packId) {
    where.packItems = { some: { packId: params.packId } };
  }

  return db.interviewQuestion.findMany({
    where,
    take: params.limitPool ?? 200,
    include: {
      answers: {
        where: { isCurrent: true },
        take: 1,
        select: { content: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function createExam(data: {
  mode: InterviewExamMode;
  topicIds: string[];
  packId?: string | null;
  questionCount: number;
  timeLimitSec?: number | null;
  items: Array<{
    questionId: string;
    sortOrder: number;
    promptSnapshot: string;
    expectedAnswerSnapshot: string;
  }>;
}) {
  const db = getDatabase();
  return db.interviewExam.create({
    data: {
      mode: data.mode,
      topicIds: data.topicIds,
      packId: data.packId ?? null,
      questionCount: data.questionCount,
      timeLimitSec: data.timeLimitSec ?? null,
      items: {
        create: data.items,
      },
    },
    include: {
      items: { orderBy: { sortOrder: "asc" }, include: { question: true } },
    },
  });
}

export async function getExamById(id: string) {
  const db = getDatabase();
  return db.interviewExam.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: {
          question: {
            include: { topic: true },
          },
        },
      },
    },
  });
}

export async function listExams(page: number, pageSize: number) {
  const db = getDatabase();
  const [exams, total] = await Promise.all([
    db.interviewExam.findMany({
      orderBy: { startedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.interviewExam.count(),
  ]);
  return { exams, total, page, pageSize };
}

export async function updateExamItem(
  id: string,
  data: {
    userAnswer?: string | null;
    result?: InterviewExamItemResult;
    selfScore?: number | null;
    aiFeedback?: string | null;
    timeSpentSec?: number | null;
  },
) {
  const db = getDatabase();
  return db.interviewExamItem.update({ where: { id }, data });
}

export async function completeExam(
  id: string,
  scorePct: number,
) {
  const db = getDatabase();
  return db.interviewExam.update({
    where: { id },
    data: {
      status: "COMPLETED",
      scorePct,
      completedAt: new Date(),
    },
  });
}

export async function listLearningItems(params: {
  status?: InterviewLearningStatus | undefined;
  page: number;
  pageSize: number;
}) {
  const db = getDatabase();
  const where: Prisma.InterviewLearningItemWhereInput = {};
  if (params.status) where.status = params.status;

  const [items, total] = await Promise.all([
    db.interviewLearningItem.findMany({
      where,
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      include: {
        topic: true,
        contents: { orderBy: { createdAt: "desc" } },
      },
    }),
    db.interviewLearningItem.count({ where }),
  ]);

  return { items, total, page: params.page, pageSize: params.pageSize };
}

export async function getLearningItemById(id: string) {
  const db = getDatabase();
  return db.interviewLearningItem.findUnique({
    where: { id },
    include: {
      topic: true,
      contents: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function createLearningItem(data: {
  title: string;
  description?: string | null;
  source?: InterviewLearningSource;
  status?: InterviewLearningStatus;
  priority?: number;
  relatedSkillName?: string | null;
  topicId?: string | null;
  skillId?: string | null;
  projectId?: string | null;
  jobApplicationId?: string | null;
}) {
  const db = getDatabase();
  return db.interviewLearningItem.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      source: data.source ?? "MANUAL",
      status: data.status ?? "SUGGESTED",
      priority: data.priority ?? 0,
      relatedSkillName: data.relatedSkillName ?? null,
      topicId: data.topicId ?? null,
      skillId: data.skillId ?? null,
      projectId: data.projectId ?? null,
      jobApplicationId: data.jobApplicationId ?? null,
    },
  });
}

export async function updateLearningItem(
  id: string,
  data: Prisma.InterviewLearningItemUncheckedUpdateInput,
) {
  const db = getDatabase();
  return db.interviewLearningItem.update({ where: { id }, data });
}

export async function deleteLearningItem(id: string) {
  const db = getDatabase();
  return db.interviewLearningItem.delete({ where: { id } });
}

export async function createLearningContent(data: {
  learningItemId: string;
  kind: "NOTES" | "CHEATSHEET" | "PRACTICE_QUESTIONS" | "PROJECT_IDEA";
  title: string;
  content: string;
  generated?: boolean;
  provider?: string | null;
  model?: string | null;
}) {
  const db = getDatabase();
  return db.interviewLearningContent.create({ data });
}

export async function createGeneration(data: {
  targetType: string;
  targetId: string;
  provider: string;
  model: string;
  promptVersion: string;
  inputSnapshot: Prisma.InputJsonValue;
  status: string;
}) {
  const db = getDatabase();
  return db.interviewPrepGeneration.create({ data });
}

export async function finishGeneration(
  id: string,
  data: {
    status: string;
    outputSnapshot?: Prisma.InputJsonValue;
    errorCode?: string | null;
    errorMessage?: string | null;
  },
) {
  const db = getDatabase();
  return db.interviewPrepGeneration.update({
    where: { id },
    data: {
      ...data,
      completedAt: new Date(),
    },
  });
}

export async function getDashboardStats() {
  const db = getDatabase();
  const now = new Date();

  const [
    questionCount,
    unansweredCount,
    dueCount,
    weakCount,
    openLearning,
    recentExams,
    topics,
  ] = await Promise.all([
    db.interviewQuestion.count(),
    db.interviewQuestion.count({
      where: { answers: { none: { isCurrent: true } } },
    }),
    db.interviewQuestion.count({
      where: { nextReviewAt: { lte: now } },
    }),
    db.interviewQuestion.count({
      where: { mastery: { in: ["UNKNOWN", "WEAK"] } },
    }),
    db.interviewLearningItem.count({
      where: { status: { in: ["SUGGESTED", "ACCEPTED", "IN_PROGRESS"] } },
    }),
    db.interviewExam.findMany({
      orderBy: { startedAt: "desc" },
      take: 5,
    }),
    db.interviewTopic.findMany({
      where: { visible: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { questions: true } },
      },
    }),
  ]);

  return {
    questionCount,
    unansweredCount,
    dueCount,
    weakCount,
    openLearning,
    recentExams,
    topics,
  };
}

export async function getAnalytics() {
  const db = getDatabase();
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setUTCDate(weekAgo.getUTCDate() - 7);

  const [
    masteryGroups,
    completedExams,
    weakByTopic,
    dueSoon,
    answeredCount,
    generatedAnswerCount,
    learningByStatus,
    packCount,
    openJobGaps,
  ] = await Promise.all([
    db.interviewQuestion.groupBy({
      by: ["mastery"],
      _count: { _all: true },
    }),
    db.interviewExam.findMany({
      where: { status: "COMPLETED", scorePct: { not: null } },
      orderBy: { completedAt: "desc" },
      take: 12,
      select: {
        id: true,
        mode: true,
        scorePct: true,
        questionCount: true,
        completedAt: true,
        startedAt: true,
      },
    }),
    db.interviewQuestion.findMany({
      where: { mastery: { in: ["UNKNOWN", "WEAK"] } },
      select: {
        topicId: true,
        topic: { select: { name: true } },
      },
    }),
    db.interviewQuestion.count({
      where: {
        OR: [
          { nextReviewAt: { lte: now } },
          {
            nextReviewAt: {
              gt: now,
              lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
            },
          },
        ],
      },
    }),
    db.interviewQuestion.count({
      where: { answers: { some: { isCurrent: true } } },
    }),
    db.interviewAnswer.count({ where: { generated: true, isCurrent: true } }),
    db.interviewLearningItem.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    db.interviewPack.count(),
    db.interviewLearningItem.count({
      where: {
        source: "JOB_GAP",
        status: { in: ["SUGGESTED", "ACCEPTED", "IN_PROGRESS"] },
      },
    }),
  ]);

  const jobApps = await listJobApplicationsWithGaps(12);

  const weakTopicMap = new Map<string, { name: string; count: number }>();
  for (const row of weakByTopic) {
    const key = row.topicId ?? "uncategorized";
    const name = row.topic?.name ?? "Uncategorized";
    const existing = weakTopicMap.get(key);
    if (existing) existing.count += 1;
    else weakTopicMap.set(key, { name, count: 1 });
  }

  const examTrend = [...completedExams].reverse();
  const avgScore =
    examTrend.length > 0
      ? Math.round(
          (examTrend.reduce((sum, e) => sum + (e.scorePct ?? 0), 0) /
            examTrend.length) *
            10,
        ) / 10
      : null;

  return {
    mastery: masteryGroups.map((g) => ({
      mastery: g.mastery,
      count: g._count._all,
    })),
    examTrend,
    avgScore,
    weakTopics: [...weakTopicMap.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    dueSoon,
    answeredCount,
    generatedAnswerCount,
    learningByStatus: learningByStatus.map((g) => ({
      status: g.status,
      count: g._count._all,
    })),
    packCount,
    examsLast7Days: completedExams.filter(
      (e) => e.completedAt && e.completedAt >= weekAgo,
    ).length,
    openJobGaps,
    jobApps,
    unsyncedJobApps: jobApps.filter((a) => a.needsSync).length,
  };
}

export async function listJobApplicationsWithGaps(limit = 20) {
  const db = getDatabase();
  const apps = await db.jobApplication.findMany({
    orderBy: { updatedAt: "desc" },
    take: 80,
    select: {
      id: true,
      companyName: true,
      roleTitle: true,
      status: true,
      updatedAt: true,
      artifacts: {
        where: { kind: { in: ["gaps", "interviewPoints"] } },
        select: { kind: true, content: true },
      },
    },
  });

  const withGaps = apps
    .map((app) => {
      const gaps = app.artifacts.find((a) => a.kind === "gaps")?.content ?? "";
      const points =
        app.artifacts.find((a) => a.kind === "interviewPoints")?.content ?? "";
      const gapLines = gaps
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length >= 8);
      const pointLines = points
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length >= 8);
      return {
        id: app.id,
        companyName: app.companyName,
        roleTitle: app.roleTitle,
        status: app.status,
        updatedAt: app.updatedAt,
        gapCount: gapLines.length,
        interviewPointCount: pointLines.length,
      };
    })
    .filter((app) => app.gapCount > 0 || app.interviewPointCount > 0)
    .slice(0, limit);

  const linked = await db.interviewLearningItem.groupBy({
    by: ["jobApplicationId"],
    where: {
      source: "JOB_GAP",
      jobApplicationId: { in: withGaps.map((a) => a.id) },
      status: { not: "DISMISSED" },
    },
    _count: { _all: true },
  });
  const linkedMap = new Map(
    linked
      .filter((row) => row.jobApplicationId)
      .map((row) => [row.jobApplicationId!, row._count._all]),
  );

  return withGaps.map((app) => ({
    ...app,
    linkedLearningCount: linkedMap.get(app.id) ?? 0,
    needsSync: (linkedMap.get(app.id) ?? 0) < app.gapCount,
  }));
}

export async function getJobGapAnalyticsSummary() {
  const db = getDatabase();
  const [openJobGaps, apps] = await Promise.all([
    db.interviewLearningItem.count({
      where: {
        source: "JOB_GAP",
        status: { in: ["SUGGESTED", "ACCEPTED", "IN_PROGRESS"] },
      },
    }),
    listJobApplicationsWithGaps(20),
  ]);

  return {
    openJobGaps,
    apps,
    unsyncedCount: apps.filter((a) => a.needsSync).length,
  };
}

export async function bulkUpdateQuestions(params: {
  ids: string[];
  topicId?: string | null;
  addTags?: string[];
  starred?: boolean;
  mastery?: InterviewMastery;
}) {
  const db = getDatabase();
  if (!params.ids.length) return { count: 0 };

  if (params.addTags?.length) {
    const questions = await db.interviewQuestion.findMany({
      where: { id: { in: params.ids } },
      select: { id: true, tags: true },
    });
    await Promise.all(
      questions.map((q) =>
        db.interviewQuestion.update({
          where: { id: q.id },
          data: {
            tags: [...new Set([...q.tags, ...params.addTags!])],
            ...(params.topicId !== undefined ? { topicId: params.topicId } : {}),
            ...(params.starred != null ? { starred: params.starred } : {}),
            ...(params.mastery ? { mastery: params.mastery } : {}),
          },
        }),
      ),
    );
    return { count: questions.length };
  }

  const data: Prisma.InterviewQuestionUncheckedUpdateManyInput = {};
  if (params.topicId !== undefined) data.topicId = params.topicId;
  if (params.starred != null) data.starred = params.starred;
  if (params.mastery) data.mastery = params.mastery;

  const result = await db.interviewQuestion.updateMany({
    where: { id: { in: params.ids } },
    data,
  });
  return { count: result.count };
}

export async function listQuestionsForExport(params?: {
  topicId?: string | null;
  packId?: string | null;
}) {
  const db = getDatabase();
  const where: Prisma.InterviewQuestionWhereInput = {};
  if (params?.topicId) where.topicId = params.topicId;
  if (params?.packId) {
    where.packItems = { some: { packId: params.packId } };
  }

  return db.interviewQuestion.findMany({
    where,
    orderBy: [{ topic: { sortOrder: "asc" } }, { updatedAt: "desc" }],
    include: {
      topic: true,
      answers: { where: { isCurrent: true }, take: 1 },
    },
  });
}

export async function listUnansweredQuestionIds(limit = 10) {
  const db = getDatabase();
  const rows = await db.interviewQuestion.findMany({
    where: { answers: { none: { isCurrent: true } } },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: { id: true },
  });
  return rows.map((r) => r.id);
}

export async function findSkillByName(name: string) {
  const db = getDatabase();
  return db.skill.findFirst({
    where: { name: { equals: name, mode: "insensitive" } },
  });
}

export async function createDraftSkill(data: {
  name: string;
  slug: string;
  categoryId: string;
  proficiency?: number | null;
}) {
  const db = getDatabase();
  return db.skill.create({
    data: {
      name: data.name,
      slug: data.slug,
      categoryId: data.categoryId,
      proficiency: data.proficiency ?? 20,
      highlighted: false,
      visible: false,
      sortOrder: 999,
    },
  });
}

export async function listSkillCategories() {
  const db = getDatabase();
  return db.skillCategory.findMany({
    where: { visible: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });
}

export async function listLowProficiencySkills(limit = 12) {
  const db = getDatabase();
  return db.skill.findMany({
    where: {
      visible: true,
      OR: [{ proficiency: { lt: 60 } }, { proficiency: null }],
    },
    orderBy: [{ proficiency: "asc" }, { name: "asc" }],
    take: limit,
    include: { category: true },
  });
}

export async function findLearningBySkillName(skillName: string) {
  const db = getDatabase();
  return db.interviewLearningItem.findFirst({
    where: {
      relatedSkillName: { equals: skillName, mode: "insensitive" },
      status: { not: "DISMISSED" },
    },
  });
}

export async function findQuestionByPrompt(prompt: string) {
  const db = getDatabase();
  return db.interviewQuestion.findFirst({
    where: { prompt: { equals: prompt, mode: "insensitive" } },
    select: { id: true },
  });
}

export async function findQuestionByJobSource(params: {
  jobApplicationId: string;
  prompt: string;
}) {
  const db = getDatabase();
  return db.interviewQuestion.findFirst({
    where: {
      jobApplicationId: params.jobApplicationId,
      prompt: params.prompt,
      source: "job-app",
    },
    select: { id: true },
  });
}

export async function findLearningByJobGap(params: {
  jobApplicationId: string;
  title: string;
}) {
  const db = getDatabase();
  return db.interviewLearningItem.findFirst({
    where: {
      jobApplicationId: params.jobApplicationId,
      source: "JOB_GAP",
      title: params.title,
      status: { not: "DISMISSED" },
    },
    select: { id: true },
  });
}

export async function listPacks() {
  const db = getDatabase();
  return db.interviewPack.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { items: true, exams: true } },
    },
  });
}

export async function getPackById(id: string) {
  const db = getDatabase();
  return db.interviewPack.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
        include: {
          question: {
            include: {
              topic: true,
              answers: { where: { isCurrent: true }, take: 1 },
            },
          },
        },
      },
      exams: {
        orderBy: { startedAt: "desc" },
        take: 10,
      },
    },
  });
}

export async function createPack(data: {
  title: string;
  companyName?: string | null;
  roleTitle?: string | null;
  notes?: string | null;
  targetDate?: Date | null;
  jobApplicationId?: string | null;
}) {
  const db = getDatabase();
  return db.interviewPack.create({
    data: {
      title: data.title,
      companyName: data.companyName ?? null,
      roleTitle: data.roleTitle ?? null,
      notes: data.notes ?? null,
      targetDate: data.targetDate ?? null,
      jobApplicationId: data.jobApplicationId ?? null,
    },
  });
}

export async function updatePack(
  id: string,
  data: Prisma.InterviewPackUncheckedUpdateInput,
) {
  const db = getDatabase();
  return db.interviewPack.update({ where: { id }, data });
}

export async function deletePack(id: string) {
  const db = getDatabase();
  return db.interviewPack.delete({ where: { id } });
}

export async function addQuestionToPack(data: {
  packId: string;
  questionId: string;
  sortOrder?: number;
  notes?: string | null;
}) {
  const db = getDatabase();
  return db.interviewPackItem.upsert({
    where: {
      packId_questionId: {
        packId: data.packId,
        questionId: data.questionId,
      },
    },
    create: {
      packId: data.packId,
      questionId: data.questionId,
      sortOrder: data.sortOrder ?? 0,
      notes: data.notes ?? null,
    },
    update: {
      notes: data.notes ?? null,
    },
  });
}

export async function removeQuestionFromPack(packId: string, questionId: string) {
  const db = getDatabase();
  return db.interviewPackItem.delete({
    where: {
      packId_questionId: { packId, questionId },
    },
  });
}

export async function findPackByJobApplicationId(jobApplicationId: string) {
  const db = getDatabase();
  return db.interviewPack.findFirst({
    where: { jobApplicationId },
    orderBy: { createdAt: "desc" },
  });
}

export async function listQuestionsForPicker(limit = 100) {
  const db = getDatabase();
  return db.interviewQuestion.findMany({
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      id: true,
      prompt: true,
      topic: { select: { name: true } },
    },
  });
}
