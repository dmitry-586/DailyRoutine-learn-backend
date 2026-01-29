import { Injectable, NotFoundException } from '@nestjs/common';
import type { ChapterGetPayload } from '../../generated/prisma/models/Chapter.js';
import { prisma } from '../lib/prisma.js';
import type { CreateChapterDto } from './chapter-request.dto.js';
import type {
  ChapterResponseDto,
  SubchapterResponseDto,
} from './chapter-response.dto.js';

type ChapterWithSubchapters = ChapterGetPayload<{
  include: { subchapters: true };
}>;

const includeSubchapters = {
  include: {
    subchapters: { orderBy: { order: 'asc' as const } },
  },
} as const;

function toChapterResponseDto(
  chapter: ChapterWithSubchapters,
): ChapterResponseDto {
  return {
    id: chapter.id,
    partId: chapter.partId,
    title: chapter.title,
    order: chapter.order,
    subchapters: chapter.subchapters.map(
      (s): SubchapterResponseDto => ({
        id: s.id,
        chapterId: s.chapterId,
        title: s.title,
        description: s.description,
        order: s.order,
      }),
    ),
  };
}

@Injectable()
export class ChapterService {
  async findAll(partId?: string): Promise<ChapterResponseDto[]> {
    const chapters = await prisma.chapter.findMany({
      where: partId ? { partId } : undefined,
      orderBy: { order: 'asc' },
      ...includeSubchapters,
    });
    return chapters.map(toChapterResponseDto);
  }

  async findOne(id: string): Promise<ChapterResponseDto> {
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      ...includeSubchapters,
    });
    if (!chapter) {
      throw new NotFoundException(`Глава с id ${id} не найдена`);
    }
    return toChapterResponseDto(chapter);
  }

  async create(dto: CreateChapterDto): Promise<ChapterResponseDto> {
    const part = await prisma.part.findUnique({
      where: { id: dto.partId },
    });
    if (!part) {
      throw new NotFoundException(`Часть с id ${dto.partId} не найдена`);
    }
    const chapter = await prisma.chapter.create({
      data: {
        partId: dto.partId,
        title: dto.title,
        order: dto.order,
      },
    });

    return {
      id: chapter.id,
      partId: chapter.partId,
      title: chapter.title,
      order: chapter.order,
      subchapters: [],
    };
  }
}
