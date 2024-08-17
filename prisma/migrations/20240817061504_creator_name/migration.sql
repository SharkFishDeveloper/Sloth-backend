/*
  Warnings:

  - Added the required column `creatorId` to the `PullRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PullRequest" ADD COLUMN     "creatorId" TEXT NOT NULL;
