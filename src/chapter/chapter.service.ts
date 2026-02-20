import { Injectable, NotFoundException } from '@nestjs/common';
import type { ChapterGetPayload } from '../../generated/prisma/models/Chapter.js';
import { prisma } from '../lib/prisma.js';
import type {
  CreateChapterDto,
  UpdateChapterDto,
} from './chapter-request.dto.js';
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
  async recalculateGlobalChapterOrder(): Promise<void> {
    const parts = await prisma.part.findMany({
      orderBy: { order: 'asc' },
      include: { chapters: { orderBy: { order: 'asc' } } },
    });

    let globalOrder = 1;
    const updates = parts.flatMap((part) =>
      part.chapters.map((ch) => ({
        id: ch.id,
        order: globalOrder++,
      })),
    );

    await Promise.all(
      updates.map((u) =>
        prisma.chapter.update({
          where: { id: u.id },
          data: { order: u.order },
        }),
      ),
    );
  }

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
    const part = await prisma.part.findUnique({ where: { id: dto.partId } });
    if (!part) {
      throw new NotFoundException(`Часть с id ${dto.partId} не найдена`);
    }

    const chapter = await prisma.$transaction(async (tx) => {
      const chaptersToShift = await tx.chapter.findMany({
        where: {
          order: {
            gte: dto.order,
          },
        },
        select: { id: true, order: true },
        orderBy: { order: 'desc' },
      });

      for (const chapterToShift of chaptersToShift) {
        await tx.chapter.update({
          where: { id: chapterToShift.id },
          data: { order: chapterToShift.order + 1 },
        });
      }

      return await tx.chapter.create({
        data: { partId: dto.partId, title: dto.title, order: dto.order },
        ...includeSubchapters,
      });
    });

    await this.recalculateGlobalChapterOrder();

    return toChapterResponseDto(chapter);
  }

  async update(id: string, dto: UpdateChapterDto): Promise<ChapterResponseDto> {
    const existing = await prisma.chapter.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Глава с id ${id} не найдена`);
    }

    if (dto.partId !== undefined) {
      const part = await prisma.part.findUnique({ where: { id: dto.partId } });
      if (!part) {
        throw new NotFoundException(`Часть с id ${dto.partId} не найдена`);
      }
    }

    const data: { partId?: string; title?: string; order?: number } = {};
    if (dto.partId !== undefined) data.partId = dto.partId;
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.order !== undefined) data.order = dto.order;

    if (Object.keys(data).length === 0) {
      return this.findOne(id);
    }

    if (dto.order !== undefined && dto.order !== existing.order) {
      const chapter = await prisma.$transaction(async (tx) => {
        const oldOrder = existing.order;
        const newOrder = dto.order!;

        if (newOrder > oldOrder) {
          const chaptersToShift = await tx.chapter.findMany({
            where: {
              id: { not: id },
              order: {
                gt: oldOrder,
                lte: newOrder,
              },
            },
            select: { id: true, order: true },
            orderBy: { order: 'asc' },
          });

          for (const chapterToShift of chaptersToShift) {
            await tx.chapter.update({
              where: { id: chapterToShift.id },
              data: { order: chapterToShift.order - 1 },
            });
          }
        } else {
          const chaptersToShift = await tx.chapter.findMany({
            where: {
              id: { not: id },
              order: {
                gte: newOrder,
                lt: oldOrder,
              },
            },
            select: { id: true, order: true },
            orderBy: { order: 'desc' },
          });

          for (const chapterToShift of chaptersToShift) {
            await tx.chapter.update({
              where: { id: chapterToShift.id },
              data: { order: chapterToShift.order + 1 },
            });
          }
        }

        return await tx.chapter.update({
          where: { id },
          data,
          ...includeSubchapters,
        });
      });

      await this.recalculateGlobalChapterOrder();

      return toChapterResponseDto(chapter);
    }

    if (dto.partId !== undefined && dto.partId !== existing.partId) {
      const chapter = await prisma.chapter.update({
        where: { id },
        data,
        ...includeSubchapters,
      });
      return toChapterResponseDto(chapter);
    }

    const chapter = await prisma.chapter.update({
      where: { id },
      data,
      ...includeSubchapters,
    });
    return toChapterResponseDto(chapter);
  }

  async delete(id: string): Promise<void> {
    const chapter = await prisma.chapter.findUnique({ where: { id } });
    if (!chapter) {
      throw new NotFoundException(`Глава с id ${id} не найдена`);
    }

    await prisma.$transaction(async (tx) => {
      const chaptersToShift = await tx.chapter.findMany({
        where: {
          order: {
            gt: chapter.order,
          },
        },
        select: { id: true, order: true },
        orderBy: { order: 'asc' },
      });

      for (const chapterToShift of chaptersToShift) {
        await tx.chapter.update({
          where: { id: chapterToShift.id },
          data: { order: chapterToShift.order - 1 },
        });
      }

      await tx.chapter.delete({ where: { id } });
    });

    await this.recalculateGlobalChapterOrder();
  }
}
