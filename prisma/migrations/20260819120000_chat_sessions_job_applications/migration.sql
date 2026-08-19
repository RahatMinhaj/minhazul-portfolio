-- AlterTable: ContactMessage timestamps
DO $$ BEGIN
  ALTER TABLE "ContactMessage" ADD COLUMN "repliedAt" TIMESTAMP(3);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "ContactMessage" ADD COLUMN "archivedAt" TIMESTAMP(3);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "ContactMessage" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- CreateEnum: ChatTurnRole
DO $$ BEGIN
  CREATE TYPE "ChatTurnRole" AS ENUM ('user', 'assistant');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum: JobApplicationStatus
DO $$ BEGIN
  CREATE TYPE "JobApplicationStatus" AS ENUM ('DRAFT', 'GENERATED', 'READY', 'SENDING', 'SENT', 'FAILED', 'ARCHIVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum: EmailDeliveryStatus
DO $$ BEGIN
  CREATE TYPE "EmailDeliveryStatus" AS ENUM ('PENDING', 'SENDING', 'SENT', 'FAILED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateTable: ChatSession
DO $$ BEGIN
  CREATE TABLE "ChatSession" (
      "id" TEXT NOT NULL,
      "sessionToken" TEXT NOT NULL,
      "clientHash" TEXT NOT NULL,
      "messageCount" INTEGER NOT NULL DEFAULT 0,
      "status" TEXT NOT NULL DEFAULT 'active',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- CreateTable: ChatTurn
DO $$ BEGIN
  CREATE TABLE "ChatTurn" (
      "id" TEXT NOT NULL,
      "sessionId" TEXT NOT NULL,
      "role" "ChatTurnRole" NOT NULL,
      "content" TEXT NOT NULL,
      "sources" JSONB,
      "provider" TEXT,
      "model" TEXT,
      "status" TEXT NOT NULL DEFAULT 'completed',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "ChatTurn_pkey" PRIMARY KEY ("id")
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- CreateTable: JobApplication
DO $$ BEGIN
  CREATE TABLE "JobApplication" (
      "id" TEXT NOT NULL,
      "companyName" TEXT NOT NULL,
      "roleTitle" TEXT NOT NULL,
      "recipientEmail" TEXT,
      "contactName" TEXT,
      "sourceUrl" TEXT,
      "jobDescription" TEXT NOT NULL,
      "status" "JobApplicationStatus" NOT NULL DEFAULT 'DRAFT',
      "tone" TEXT,
      "notes" TEXT,
      "customCvPath" TEXT,
      "customCvName" TEXT,
      "lastGeneratedAt" TIMESTAMP(3),
      "sentAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- CreateTable: JobApplicationArtifact
DO $$ BEGIN
  CREATE TABLE "JobApplicationArtifact" (
      "id" TEXT NOT NULL,
      "applicationId" TEXT NOT NULL,
      "kind" TEXT NOT NULL,
      "customKind" TEXT,
      "title" TEXT,
      "content" TEXT NOT NULL,
      "format" TEXT NOT NULL DEFAULT 'MARKDOWN',
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "generated" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "JobApplicationArtifact_pkey" PRIMARY KEY ("id")
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- CreateTable: JobApplicationGeneration
DO $$ BEGIN
  CREATE TABLE "JobApplicationGeneration" (
      "id" TEXT NOT NULL,
      "applicationId" TEXT NOT NULL,
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
      CONSTRAINT "JobApplicationGeneration_pkey" PRIMARY KEY ("id")
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- CreateTable: JobApplicationDelivery
DO $$ BEGIN
  CREATE TABLE "JobApplicationDelivery" (
      "id" TEXT NOT NULL,
      "applicationId" TEXT NOT NULL,
      "status" "EmailDeliveryStatus" NOT NULL DEFAULT 'PENDING',
      "idempotencyKey" TEXT NOT NULL,
      "provider" TEXT NOT NULL,
      "providerMessageId" TEXT,
      "fromAddress" TEXT NOT NULL,
      "toAddress" TEXT NOT NULL,
      "replyTo" TEXT,
      "subjectSnapshot" TEXT NOT NULL,
      "textSnapshot" TEXT NOT NULL,
      "htmlSnapshot" TEXT,
      "attachmentName" TEXT,
      "attachmentHash" TEXT,
      "attemptCount" INTEGER NOT NULL DEFAULT 0,
      "lastError" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "sentAt" TIMESTAMP(3),
      CONSTRAINT "JobApplicationDelivery_pkey" PRIMARY KEY ("id")
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ChatSession_sessionToken_key" ON "ChatSession"("sessionToken");
CREATE INDEX IF NOT EXISTS "ChatSession_clientHash_updatedAt_idx" ON "ChatSession"("clientHash", "updatedAt");
CREATE INDEX IF NOT EXISTS "ChatSession_updatedAt_idx" ON "ChatSession"("updatedAt");
CREATE INDEX IF NOT EXISTS "ChatTurn_sessionId_createdAt_idx" ON "ChatTurn"("sessionId", "createdAt");
CREATE INDEX IF NOT EXISTS "JobApplication_status_updatedAt_idx" ON "JobApplication"("status", "updatedAt");
CREATE INDEX IF NOT EXISTS "JobApplication_companyName_roleTitle_idx" ON "JobApplication"("companyName", "roleTitle");
CREATE INDEX IF NOT EXISTS "JobApplicationArtifact_applicationId_kind_idx" ON "JobApplicationArtifact"("applicationId", "kind");
CREATE INDEX IF NOT EXISTS "JobApplicationGeneration_applicationId_createdAt_idx" ON "JobApplicationGeneration"("applicationId", "createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "JobApplicationDelivery_idempotencyKey_key" ON "JobApplicationDelivery"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "JobApplicationDelivery_applicationId_createdAt_idx" ON "JobApplicationDelivery"("applicationId", "createdAt");
CREATE INDEX IF NOT EXISTS "JobApplicationDelivery_status_createdAt_idx" ON "JobApplicationDelivery"("status", "createdAt");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "ChatTurn" ADD CONSTRAINT "ChatTurn_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "JobApplicationArtifact" ADD CONSTRAINT "JobApplicationArtifact_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "JobApplicationGeneration" ADD CONSTRAINT "JobApplicationGeneration_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE "JobApplicationDelivery" ADD CONSTRAINT "JobApplicationDelivery_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
