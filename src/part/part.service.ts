import { Injectable, NotFoundException } from '@nestjs/common';
import type { PartGetPayload } from '../../generated/prisma/models/Part.js';
import { ChapterService } from '../chapter/chapter.service.js';
import { prisma } from '../lib/prisma.js';
import type { CreatePartDto, UpdatePartDto } from './part-request.dto.js';
import type {
  PartChapterItemDto,
  PartResponseDto,
} from './part-response.dto.js';

type PartWithChapterHeaders = PartGetPayload<{
  include: {
    chapters: { select: { id: true; title: true; order: true } };
  };
}>;

const includeChaptersHeaders = {
  include: {
    chapters: {
      orderBy: { order: 'asc' as const },
      select: { id: true, title: true, order: true },
    },
  },
} as const;

function toPartResponseDto(part: PartWithChapterHeaders): PartResponseDto {
  return {
    id: part.id,
    title: part.title,
    order: part.order,
    chapters: part.chapters.map(
      (ch): PartChapterItemDto => ({
        id: ch.id,
        title: ch.title,
        order: ch.order,
      }),
    ),
  };
}

@Injectable()
export class PartService {
  constructor(private readonly chapterService: ChapterService) {}

  async findAll(): Promise<PartResponseDto[]> {
    const parts = await prisma.part.findMany({
      orderBy: { order: 'asc' },
      ...includeChaptersHeaders,
    });
    return parts.map(toPartResponseDto);
  }

  async findOne(id: string): Promise<PartResponseDto> {
    const part = await prisma.part.findUnique({
      where: { id },
      ...includeChaptersHeaders,
    });
    if (!part) {
      throw new NotFoundException(`Часть с id ${id} не найдена`);
    }
    return toPartResponseDto(part);
  }

  async create(dto: CreatePartDto): Promise<PartResponseDto> {
    const part = await prisma.$transaction(async (tx) => {
      const partsToShift = await tx.part.findMany({
        where: {
          order: {
            gte: dto.order,
          },
        },
        select: { id: true, order: true },
        orderBy: { order: 'desc' },
      });

      for (const partToShift of partsToShift) {
        await tx.part.update({
          where: { id: partToShift.id },
          data: { order: partToShift.order + 1 },
        });
      }

      return await tx.part.create({
        data: {
          title: dto.title,
          order: dto.order,
        },
        ...includeChaptersHeaders,
      });
    });

    await this.chapterService.recalculateGlobalChapterOrder();

    return toPartResponseDto(part);
  }

  async update(id: string, dto: UpdatePartDto): Promise<PartResponseDto> {
    const existing = await prisma.part.findUnique({
      where: { id },
      ...includeChaptersHeaders,
    });
    if (!existing) {
      throw new NotFoundException(`Часть с id ${id} не найдена`);
    }

    const data: { title?: string; order?: number } = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.order !== undefined) data.order = dto.order;
    if (Object.keys(data).length === 0) {
      return toPartResponseDto(existing);
    }

    if (dto.order !== undefined && dto.order !== existing.order) {
      const part = await prisma.$transaction(async (tx) => {
        const oldOrder = existing.order;
        const newOrder = dto.order!;

        if (newOrder > oldOrder) {
          const partsToShift = await tx.part.findMany({
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

          for (const partToShift of partsToShift) {
            await tx.part.update({
              where: { id: partToShift.id },
              data: { order: partToShift.order - 1 },
            });
          }
        } else {
          const partsToShift = await tx.part.findMany({
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

          for (const partToShift of partsToShift) {
            await tx.part.update({
              where: { id: partToShift.id },
              data: { order: partToShift.order + 1 },
            });
          }
        }

        return await tx.part.update({
          where: { id },
          data,
          ...includeChaptersHeaders,
        });
      });

      await this.chapterService.recalculateGlobalChapterOrder();

      return toPartResponseDto(part);
    }

    const part = await prisma.part.update({
      where: { id },
      data,
      ...includeChaptersHeaders,
    });

    return toPartResponseDto(part);
  }

  async delete(id: string): Promise<void> {
    const part = await prisma.part.findUnique({ where: { id } });
    if (!part) {
      throw new NotFoundException(`Часть с id ${id} не найдена`);
    }

    await prisma.$transaction(async (tx) => {
      const partsToShift = await tx.part.findMany({
        where: {
          order: {
            gt: part.order,
          },
        },
        select: { id: true, order: true },
        orderBy: { order: 'asc' },
      });

      for (const partToShift of partsToShift) {
        await tx.part.update({
          where: { id: partToShift.id },
          data: { order: partToShift.order - 1 },
        });
      }

      await tx.part.delete({ where: { id } });
    });

    await this.chapterService.recalculateGlobalChapterOrder();
  }
}
