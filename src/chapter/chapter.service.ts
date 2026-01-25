import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '../lib/prisma.js';
import {
  ChapterNavigationDto,
  ChapterResponseDto,
} from './chapter-response.dto.js';

@Injectable()
export class ChapterService {
  async findAll(partId?: string): Promise<ChapterResponseDto[]> {
    const chapters = await prisma.chapter.findMany({
      where: partId ? { partId } : undefined,
      orderBy: { order: 'asc' },
    });

    return chapters;
  }

  async findOne(id: string): Promise<ChapterResponseDto> {
    const chapter = await prisma.chapter.findUnique({
      where: { id },
    });

    if (!chapter) {
      throw new NotFoundException(`Глава с id ${id} не найдена`);
    }

    return chapter;
  }

  async findNext(id: string): Promise<ChapterNavigationDto | null> {
    const currentChapter = await this.findOne(id);

    const nextChapter = await prisma.chapter.findFirst({
      where: {
        partId: currentChapter.partId,
        order: { gt: currentChapter.order },
      },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        order: true,
      },
    });

    return nextChapter;
  }

  async findPrevious(id: string): Promise<ChapterNavigationDto | null> {
    const currentChapter = await this.findOne(id);

    const previousChapter = await prisma.chapter.findFirst({
      where: {
        partId: currentChapter.partId,
        order: { lt: currentChapter.order },
      },
      orderBy: { order: 'desc' },
      select: {
        id: true,
        title: true,
        order: true,
      },
    });

    return previousChapter;
  }
}
