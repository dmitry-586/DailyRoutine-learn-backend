import { Injectable, NotFoundException } from '@nestjs/common';
import type { CardCategory } from '../../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import type { CreateCardCategoryDto } from './card-category-request.dto.js';
import type { CardCategoryResponseDto } from './card-category-response.dto.js';

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
}
