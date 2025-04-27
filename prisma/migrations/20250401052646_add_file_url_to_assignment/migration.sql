/*
  Warnings:

  - A unique constraint covering the columns `[studentId]` on the table `Attendance` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "fileUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_studentId_key" ON "Attendance"("studentId");
