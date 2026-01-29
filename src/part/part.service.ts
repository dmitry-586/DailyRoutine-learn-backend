import { Injectable, NotFoundException } from '@nestjs/common';
import type { PartGetPayload } from '../../generated/prisma/models/Part.js';
import { prisma } from '../lib/prisma.js';
import type { CreatePartDto } from './part-request.dto.js';
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
    const part = await prisma.part.create({
      data: {
        title: dto.title,
        order: dto.order,
      },
      ...includeChaptersHeaders,
    });
    return toPartResponseDto(part);
  }
}
