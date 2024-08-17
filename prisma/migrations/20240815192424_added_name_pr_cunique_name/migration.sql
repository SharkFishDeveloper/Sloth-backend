/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "PullRequest" DROP CONSTRAINT "PullRequest_contributor_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- AddForeignKey
ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_contributor_fkey" FOREIGN KEY ("contributor") REFERENCES "User"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
