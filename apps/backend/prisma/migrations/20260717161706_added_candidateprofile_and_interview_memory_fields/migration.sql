/*
  Warnings:

  - Added the required column `candidateProfile` to the `Interview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interviewMemory` to the `Interview` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "candidateProfile" JSONB NOT NULL,
ADD COLUMN     "interviewMemory" JSONB NOT NULL;
