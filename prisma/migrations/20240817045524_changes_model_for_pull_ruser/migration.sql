/*
  Warnings:

  - Added the required column `repositoryName` to the `PullRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PullRequest" DROP CONSTRAINT "PullRequest_contributor_fkey";

-- AlterTable
ALTER TABLE "PullRequest" ADD COLUMN     "repositoryName" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_repositoryName_fkey" FOREIGN KEY ("repositoryName") REFERENCES "Repositories"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
