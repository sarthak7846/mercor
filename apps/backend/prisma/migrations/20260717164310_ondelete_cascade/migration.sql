-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_interviewId_fkey";

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
