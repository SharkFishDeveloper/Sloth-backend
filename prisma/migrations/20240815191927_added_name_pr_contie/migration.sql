-- DropForeignKey
ALTER TABLE "PullRequest" DROP CONSTRAINT "PullRequest_id_fkey";

-- AddForeignKey
ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_contributor_fkey" FOREIGN KEY ("contributor") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
