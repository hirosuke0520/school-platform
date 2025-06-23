/*
  Warnings:

  - You are about to drop the column `technology` on the `courses` table. All the data in the column will be lost.
  - You are about to drop the column `duration_minutes` on the `learning_sessions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "courses" DROP COLUMN "technology";

-- AlterTable
ALTER TABLE "learning_sessions" DROP COLUMN "duration_minutes",
ADD COLUMN     "progress_report" TEXT,
ALTER COLUMN "lesson_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "is_published" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_first_login" BOOLEAN NOT NULL DEFAULT true;
