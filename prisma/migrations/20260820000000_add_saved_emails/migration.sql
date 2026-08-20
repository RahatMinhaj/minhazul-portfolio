-- CreateTable
CREATE TABLE IF NOT EXISTS "SavedEmail" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "label" TEXT,
    "useCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SavedEmail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SavedEmail_email_key" ON "SavedEmail"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SavedEmail_email_idx" ON "SavedEmail"("email");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SavedEmail_useCount_idx" ON "SavedEmail"("useCount");
