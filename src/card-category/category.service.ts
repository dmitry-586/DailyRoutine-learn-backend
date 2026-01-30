import { Injectable, NotFoundException } from '@nestjs/common';
import type { CardCategory } from '../../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import type {
  CreateCardCategoryDto,
  UpdateCardCategoryDto,
} from './category-request.dto.js';
import type { CardCategoryResponseDto } from './category-response.dto.js';

function toCardCategoryResponseDto(c: CardCategory): CardCategoryResponseDto {
  return {
    id: c.id,
    title: c.title,
    order: c.order,
  };
}

@Injectable()
export class CardCategoryService {
  async findAll(): Promise<CardCategoryResponseDto[]> {
    const categories = await prisma.cardCategory.findMany({
      orderBy: { order: 'asc' },
    });
    return categories.map(toCardCategoryResponseDto);
  }

  async findOne(id: string): Promise<CardCategoryResponseDto> {
    const category = await prisma.cardCategory.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException(`Категория карточек с id ${id} не найдена`);
    }
    return toCardCategoryResponseDto(category);
  }

  async create(dto: CreateCardCategoryDto): Promise<CardCategoryResponseDto> {
    const category = await prisma.cardCategory.create({
      data: {
        title: dto.title,
        order: dto.order,
      },
    });
    return toCardCategoryResponseDto(category);
  }

  async update(
    id: string,
    dto: UpdateCardCategoryDto,
  ): Promise<CardCategoryResponseDto> {
    const existing = await prisma.cardCategory.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Категория карточек с id ${id} не найдена`);
    }
    const data: { title?: string; order?: number } = {};
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.order !== undefined) data.order = dto.order;
    if (Object.keys(data).length === 0) {
      return toCardCategoryResponseDto(existing);
    }
    const category = await prisma.cardCategory.update({
      where: { id },
      data,
    });
    return toCardCategoryResponseDto(category);
  }
}
