-- AlterTable
ALTER TABLE "Education" ADD COLUMN "modules" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
