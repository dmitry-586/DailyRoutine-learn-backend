/*
  Warnings:

  - You are about to drop the column `content` on the `chapters` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "chapters" DROP COLUMN "content";

-- CreateTable
CREATE TABLE "subchapters" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "subchapters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "subchapters_chapterId_idx" ON "subchapters"("chapterId");

-- AddForeignKey
ALTER TABLE "subchapters" ADD CONSTRAINT "subchapters_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
