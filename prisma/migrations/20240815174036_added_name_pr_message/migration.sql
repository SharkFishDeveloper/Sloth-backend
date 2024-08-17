/*
  Warnings:

  - Added the required column `message` to the `PullRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PullRequest" ADD COLUMN     "message" TEXT NOT NULL;
