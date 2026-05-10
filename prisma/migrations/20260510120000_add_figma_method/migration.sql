-- CreateTable
CREATE TABLE "figma_chapters" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "figma_chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "figma_sections" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "figma_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "figma_sections_chapterId_idx" ON "figma_sections"("chapterId");

-- AddForeignKey
ALTER TABLE "figma_sections" ADD CONSTRAINT "figma_sections_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "figma_chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
