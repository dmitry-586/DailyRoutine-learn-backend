import { Injectable, NotFoundException } from '@nestjs/common';
import type { Subchapter } from '../../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import type {
  CreateSubchapterDto,
  UpdateSubchapterDto,
} from './subchapter-request.dto.js';
import type { SubchapterResponseDto } from './subchapter-response.dto.js';

function toSubchapterResponseDto(s: Subchapter): SubchapterResponseDto {
  return {
    id: s.id,
    chapterId: s.chapterId,
    title: s.title,
    description: s.description,
    order: s.order,
  };
}

@Injectable()
export class SubchapterService {
  async recalculateSubchapterOrder(chapterId: string): Promise<void> {
    const subchapters = await prisma.subchapter.findMany({
      where: { chapterId },
      orderBy: { order: 'asc' },
    });

    let currentOrder = 1;
    for (const subchapter of subchapters) {
      if (subchapter.order !== currentOrder) {
        await prisma.subchapter.update({
          where: { id: subchapter.id },
          data: { order: currentOrder },
        });
      }
      currentOrder++;
    }
  }

  async findAll(chapterId?: string): Promise<SubchapterResponseDto[]> {
    const subchapters = await prisma.subchapter.findMany({
      where: chapterId ? { chapterId } : undefined,
      orderBy: { order: 'asc' },
    });
    return subchapters.map(toSubchapterResponseDto);
  }

  async findOne(id: string): Promise<SubchapterResponseDto> {
    const subchapter = await prisma.subchapter.findUnique({
      where: { id },
    });
    if (!subchapter) {
      throw new NotFoundException(`Подраздел с id ${id} не найден`);
    }
    return toSubchapterResponseDto(subchapter);
  }

  async create(dto: CreateSubchapterDto): Promise<SubchapterResponseDto> {
    const chapter = await prisma.chapter.findUnique({
      where: { id: dto.chapterId },
    });
    if (!chapter) {
      throw new NotFoundException(`Глава с id ${dto.chapterId} не найдена`);
    }

    const subchapter = await prisma.$transaction(async (tx) => {
      const toShift = await tx.subchapter.findMany({
        where: {
          chapterId: dto.chapterId,
          order: {
            gte: dto.order,
          },
        },
        select: { id: true, order: true },
        orderBy: { order: 'desc' },
      });

      for (const item of toShift) {
        await tx.subchapter.update({
          where: { id: item.id },
          data: { order: item.order + 1 },
        });
      }

      return await tx.subchapter.create({
        data: {
          chapterId: dto.chapterId,
          title: dto.title,
          description: dto.description,
          order: dto.order,
        },
      });
    });

    await this.recalculateSubchapterOrder(dto.chapterId);

    return toSubchapterResponseDto(subchapter);
  }

  async update(
    id: string,
    dto: UpdateSubchapterDto,
  ): Promise<SubchapterResponseDto> {
    const existing = await prisma.subchapter.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Подраздел с id ${id} не найден`);
    }

    if (dto.chapterId !== undefined) {
      const chapter = await prisma.chapter.findUnique({
        where: { id: dto.chapterId },
      });
      if (!chapter) {
        throw new NotFoundException(`Глава с id ${dto.chapterId} не найдена`);
      }
    }

    const data: {
      chapterId?: string;
      title?: string;
      description?: string;
      order?: number;
    } = {};
    if (dto.chapterId !== undefined) data.chapterId = dto.chapterId;
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.order !== undefined) data.order = dto.order;

    if (Object.keys(data).length === 0) {
      return toSubchapterResponseDto(existing);
    }

    if (dto.order !== undefined && dto.order !== existing.order) {
      const subchapter = await prisma.$transaction(async (tx) => {
        const oldOrder = existing.order;
        const newOrder = dto.order!;

        if (newOrder > oldOrder) {
          const toShift = await tx.subchapter.findMany({
            where: {
              id: { not: id },
              chapterId: existing.chapterId,
              order: {
                gt: oldOrder,
                lte: newOrder,
              },
            },
            select: { id: true, order: true },
            orderBy: { order: 'asc' },
          });

          for (const item of toShift) {
            await tx.subchapter.update({
              where: { id: item.id },
              data: { order: item.order - 1 },
            });
          }
        } else {
          const toShift = await tx.subchapter.findMany({
            where: {
              id: { not: id },
              chapterId: existing.chapterId,
              order: {
                gte: newOrder,
                lt: oldOrder,
              },
            },
            select: { id: true, order: true },
            orderBy: { order: 'desc' },
          });

          for (const item of toShift) {
            await tx.subchapter.update({
              where: { id: item.id },
              data: { order: item.order + 1 },
            });
          }
        }

        return await tx.subchapter.update({
          where: { id },
          data,
        });
      });

      await this.recalculateSubchapterOrder(existing.chapterId);

      return toSubchapterResponseDto(subchapter);
    }

    const subchapter = await prisma.subchapter.update({
      where: { id },
      data,
    });

    if (dto.chapterId !== undefined && dto.chapterId !== existing.chapterId) {
      await this.recalculateSubchapterOrder(existing.chapterId);
      await this.recalculateSubchapterOrder(dto.chapterId);
    }

    return toSubchapterResponseDto(subchapter);
  }

  async delete(id: string): Promise<void> {
    const subchapter = await prisma.subchapter.findUnique({ where: { id } });
    if (!subchapter) {
      throw new NotFoundException(`Подраздел с id ${id} не найден`);
    }

    await prisma.$transaction(async (tx) => {
      const toShift = await tx.subchapter.findMany({
        where: {
          chapterId: subchapter.chapterId,
          order: { gt: subchapter.order },
        },
        select: { id: true, order: true },
        orderBy: { order: 'asc' },
      });

      for (const item of toShift) {
        await tx.subchapter.update({
          where: { id: item.id },
          data: { order: item.order - 1 },
        });
      }

      await tx.subchapter.delete({ where: { id } });
    });

    await this.recalculateSubchapterOrder(subchapter.chapterId);
  }
}
