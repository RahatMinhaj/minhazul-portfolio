-- CreateEnum
CREATE TYPE "InterviewDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');
CREATE TYPE "InterviewQuestionType" AS ENUM ('CONCEPTUAL', 'BEHAVIORAL', 'SYSTEM_DESIGN', 'CODING', 'DEBUGGING', 'PORTFOLIO_WALKTHROUGH');
CREATE TYPE "InterviewMastery" AS ENUM ('UNKNOWN', 'WEAK', 'OK', 'STRONG');
CREATE TYPE "InterviewExamMode" AS ENUM ('RANDOM', 'WEAK_FOCUS', 'TOPIC_FOCUS');
CREATE TYPE "InterviewExamStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');
CREATE TYPE "InterviewExamItemResult" AS ENUM ('UNANSWERED', 'CORRECT', 'PARTIAL', 'INCORRECT', 'SKIPPED');
CREATE TYPE "InterviewLearningStatus" AS ENUM ('SUGGESTED', 'ACCEPTED', 'IN_PROGRESS', 'DONE', 'DISMISSED');
CREATE TYPE "InterviewLearningSource" AS ENUM ('PORTFOLIO_GAP', 'JOB_GAP', 'MANUAL', 'EXAM_WEAKNESS', 'AI_SCAN');
CREATE TYPE "InterviewLearningContentKind" AS ENUM ('NOTES', 'CHEATSHEET', 'PRACTICE_QUESTIONS', 'PROJECT_IDEA');

-- CreateTable
CREATE TABLE "InterviewTopic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" TEXT,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "visible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "InterviewTopic_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InterviewQuestion" (
    "id" TEXT NOT NULL,
    "topicId" TEXT,
    "prompt" TEXT NOT NULL,
    "questionType" "InterviewQuestionType" NOT NULL DEFAULT 'CONCEPTUAL',
    "difficulty" "InterviewDifficulty" NOT NULL DEFAULT 'MEDIUM',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source" TEXT NOT NULL DEFAULT 'manual',
    "sourceRef" TEXT,
    "confidence" INTEGER,
    "mastery" "InterviewMastery" NOT NULL DEFAULT 'UNKNOWN',
    "starred" BOOLEAN NOT NULL DEFAULT false,
    "timesAsked" INTEGER NOT NULL DEFAULT 0,
    "timesCorrect" INTEGER NOT NULL DEFAULT 0,
    "lastReviewedAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3),
    "relatedSkillId" TEXT,
    "relatedProjectId" TEXT,
    "jobApplicationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "InterviewQuestion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InterviewAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "format" TEXT NOT NULL DEFAULT 'MARKDOWN',
    "version" INTEGER NOT NULL DEFAULT 1,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "generated" BOOLEAN NOT NULL DEFAULT false,
    "provider" TEXT,
    "model" TEXT,
    "promptVersion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "InterviewAnswer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InterviewExam" (
    "id" TEXT NOT NULL,
    "mode" "InterviewExamMode" NOT NULL DEFAULT 'RANDOM',
    "topicIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "questionCount" INTEGER NOT NULL,
    "status" "InterviewExamStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "scorePct" DOUBLE PRECISION,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "InterviewExam_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InterviewExamItem" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "promptSnapshot" TEXT NOT NULL,
    "expectedAnswerSnapshot" TEXT NOT NULL DEFAULT '',
    "userAnswer" TEXT,
    "result" "InterviewExamItemResult" NOT NULL DEFAULT 'UNANSWERED',
    "selfScore" INTEGER,
    "timeSpentSec" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "InterviewExamItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InterviewLearningItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "InterviewLearningStatus" NOT NULL DEFAULT 'SUGGESTED',
    "source" "InterviewLearningSource" NOT NULL DEFAULT 'MANUAL',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "relatedSkillName" TEXT,
    "topicId" TEXT,
    "skillId" TEXT,
    "projectId" TEXT,
    "jobApplicationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "InterviewLearningItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InterviewLearningContent" (
    "id" TEXT NOT NULL,
    "learningItemId" TEXT NOT NULL,
    "kind" "InterviewLearningContentKind" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "generated" BOOLEAN NOT NULL DEFAULT false,
    "provider" TEXT,
    "model" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "InterviewLearningContent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InterviewPrepGeneration" (
    "id" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "inputSnapshot" JSONB NOT NULL,
    "outputSnapshot" JSONB,
    "status" TEXT NOT NULL,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    CONSTRAINT "InterviewPrepGeneration_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "InterviewTopic_slug_key" ON "InterviewTopic"("slug");
CREATE INDEX "InterviewTopic_parentId_sortOrder_idx" ON "InterviewTopic"("parentId", "sortOrder");
CREATE INDEX "InterviewTopic_visible_sortOrder_idx" ON "InterviewTopic"("visible", "sortOrder");

CREATE INDEX "InterviewQuestion_topicId_mastery_idx" ON "InterviewQuestion"("topicId", "mastery");
CREATE INDEX "InterviewQuestion_nextReviewAt_idx" ON "InterviewQuestion"("nextReviewAt");
CREATE INDEX "InterviewQuestion_starred_idx" ON "InterviewQuestion"("starred");
CREATE INDEX "InterviewQuestion_mastery_difficulty_idx" ON "InterviewQuestion"("mastery", "difficulty");

CREATE INDEX "InterviewAnswer_questionId_isCurrent_idx" ON "InterviewAnswer"("questionId", "isCurrent");

CREATE INDEX "InterviewExam_status_startedAt_idx" ON "InterviewExam"("status", "startedAt");

CREATE INDEX "InterviewExamItem_examId_sortOrder_idx" ON "InterviewExamItem"("examId", "sortOrder");
CREATE INDEX "InterviewExamItem_questionId_idx" ON "InterviewExamItem"("questionId");

CREATE INDEX "InterviewLearningItem_status_priority_idx" ON "InterviewLearningItem"("status", "priority");
CREATE INDEX "InterviewLearningItem_source_idx" ON "InterviewLearningItem"("source");

CREATE INDEX "InterviewLearningContent_learningItemId_kind_idx" ON "InterviewLearningContent"("learningItemId", "kind");

CREATE INDEX "InterviewPrepGeneration_targetType_targetId_createdAt_idx" ON "InterviewPrepGeneration"("targetType", "targetId", "createdAt");

-- ForeignKeys
ALTER TABLE "InterviewTopic" ADD CONSTRAINT "InterviewTopic_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "InterviewTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InterviewQuestion" ADD CONSTRAINT "InterviewQuestion_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "InterviewTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InterviewAnswer" ADD CONSTRAINT "InterviewAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "InterviewQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InterviewExamItem" ADD CONSTRAINT "InterviewExamItem_examId_fkey" FOREIGN KEY ("examId") REFERENCES "InterviewExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InterviewExamItem" ADD CONSTRAINT "InterviewExamItem_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "InterviewQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InterviewLearningItem" ADD CONSTRAINT "InterviewLearningItem_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "InterviewTopic"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "InterviewLearningContent" ADD CONSTRAINT "InterviewLearningContent_learningItemId_fkey" FOREIGN KEY ("learningItemId") REFERENCES "InterviewLearningItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
