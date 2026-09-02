-- AlterEnum
ALTER TYPE "InterviewExamMode" ADD VALUE IF NOT EXISTS 'PACK_FOCUS';
ALTER TYPE "InterviewExamMode" ADD VALUE IF NOT EXISTS 'DUE_FOCUS';

-- AlterTable
ALTER TABLE "InterviewExam" ADD COLUMN IF NOT EXISTS "packId" TEXT;
ALTER TABLE "InterviewExamItem" ADD COLUMN IF NOT EXISTS "aiFeedback" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "InterviewPack" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "companyName" TEXT,
    "roleTitle" TEXT,
    "notes" TEXT,
    "targetDate" TIMESTAMP(3),
    "jobApplicationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "InterviewPack_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "InterviewPackItem" (
    "id" TEXT NOT NULL,
    "packId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InterviewPackItem_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE INDEX IF NOT EXISTS "InterviewQuestion_jobApplicationId_idx" ON "InterviewQuestion"("jobApplicationId");
CREATE INDEX IF NOT EXISTS "InterviewExam_packId_idx" ON "InterviewExam"("packId");
CREATE INDEX IF NOT EXISTS "InterviewPack_jobApplicationId_idx" ON "InterviewPack"("jobApplicationId");
CREATE INDEX IF NOT EXISTS "InterviewPack_targetDate_idx" ON "InterviewPack"("targetDate");
CREATE INDEX IF NOT EXISTS "InterviewPack_updatedAt_idx" ON "InterviewPack"("updatedAt");
CREATE UNIQUE INDEX IF NOT EXISTS "InterviewPackItem_packId_questionId_key" ON "InterviewPackItem"("packId", "questionId");
CREATE INDEX IF NOT EXISTS "InterviewPackItem_packId_sortOrder_idx" ON "InterviewPackItem"("packId", "sortOrder");
CREATE INDEX IF NOT EXISTS "InterviewPackItem_questionId_idx" ON "InterviewPackItem"("questionId");

-- ForeignKeys
DO $$ BEGIN
  ALTER TABLE "InterviewExam" ADD CONSTRAINT "InterviewExam_packId_fkey"
    FOREIGN KEY ("packId") REFERENCES "InterviewPack"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "InterviewPackItem" ADD CONSTRAINT "InterviewPackItem_packId_fkey"
    FOREIGN KEY ("packId") REFERENCES "InterviewPack"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "InterviewPackItem" ADD CONSTRAINT "InterviewPackItem_questionId_fkey"
    FOREIGN KEY ("questionId") REFERENCES "InterviewQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
