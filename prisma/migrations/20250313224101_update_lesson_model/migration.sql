/*
  Warnings:

  - Added the required column `title` to the `Lesson` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "content" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;
