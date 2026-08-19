-- AlterTable: Add circularContent column to JobApplication
ALTER TABLE "JobApplication" ADD COLUMN "circularContent" TEXT NOT NULL DEFAULT '';
