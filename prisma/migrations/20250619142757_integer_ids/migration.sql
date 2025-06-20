/*
  Warnings:

  - The primary key for the `chapters` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `chapters` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `courses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `courses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `lessons` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `lessons` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `course_id` on the `chapters` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `lesson_id` on the `learning_sessions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `chapter_id` on the `lessons` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `lesson_id` on the `user_progress` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "chapters" DROP CONSTRAINT "chapters_course_id_fkey";

-- DropForeignKey
ALTER TABLE "learning_sessions" DROP CONSTRAINT "learning_sessions_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_chapter_id_fkey";

-- DropForeignKey
ALTER TABLE "user_progress" DROP CONSTRAINT "user_progress_lesson_id_fkey";

-- AlterTable
ALTER TABLE "chapters" DROP CONSTRAINT "chapters_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "course_id",
ADD COLUMN     "course_id" INTEGER NOT NULL,
ADD CONSTRAINT "chapters_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "courses" DROP CONSTRAINT "courses_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "learning_sessions" DROP COLUMN "lesson_id",
ADD COLUMN     "lesson_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "lessons" DROP CONSTRAINT "lessons_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "chapter_id",
ADD COLUMN     "chapter_id" INTEGER NOT NULL,
ADD CONSTRAINT "lessons_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "user_progress" DROP COLUMN "lesson_id",
ADD COLUMN     "lesson_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_user_id_lesson_id_key" ON "user_progress"("user_id", "lesson_id");

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_sessions" ADD CONSTRAINT "learning_sessions_lesson_id_fkey" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
