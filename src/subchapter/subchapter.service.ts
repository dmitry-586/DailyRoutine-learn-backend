import { Injectable, NotFoundException } from '@nestjs/common';
import type { Subchapter } from '../../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import type { CreateSubchapterDto } from './subchapter-request.dto.js';
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
    const subchapter = await prisma.subchapter.create({
      data: {
        chapterId: dto.chapterId,
        title: dto.title,
        description: dto.description,
        order: dto.order,
      },
    });
    return toSubchapterResponseDto(subchapter);
  }
}
