-- AlterTable
ALTER TABLE "Result" ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "score" DROP NOT NULL;
