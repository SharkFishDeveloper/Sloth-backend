/*
  Warnings:

  - You are about to drop the column `repoName` on the `PullRequest` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PullRequest" DROP CONSTRAINT "PullRequest_contributor_fkey";

-- AlterTable
ALTER TABLE "PullRequest" DROP COLUMN "repoName";

-- CreateTable
CREATE TABLE "UserPullRequest" (
    "id" TEXT NOT NULL,
    "repoName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userName" TEXT NOT NULL,

    CONSTRAINT "UserPullRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_contributor_fkey" FOREIGN KEY ("contributor") REFERENCES "Repositories"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPullRequest" ADD CONSTRAINT "UserPullRequest_userName_fkey" FOREIGN KEY ("userName") REFERENCES "User"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
