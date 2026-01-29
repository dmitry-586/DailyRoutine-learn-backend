import { Injectable, NotFoundException } from '@nestjs/common';
import type { Card } from '../../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import type { CreateCardDto } from './card-request.dto.js';
import type { CardResponseDto } from './card-response.dto.js';

function toCardResponseDto(c: Card): CardResponseDto {
  return {
    id: c.id,
    categoryId: c.categoryId,
    question: c.question,
    answer: c.answer,
    difficulty: c.difficulty,
  };
}

@Injectable()
export class CardService {
  async findAll(categoryId?: string): Promise<CardResponseDto[]> {
    const cards = await prisma.card.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: { difficulty: 'asc' },
    });
    return cards.map(toCardResponseDto);
  }

  async findOne(id: string): Promise<CardResponseDto> {
    const card = await prisma.card.findUnique({
      where: { id },
    });
    if (!card) {
      throw new NotFoundException(`Карточка с id ${id} не найдена`);
    }
    return toCardResponseDto(card);
  }

  async create(dto: CreateCardDto): Promise<CardResponseDto> {
    const category = await prisma.cardCategory.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException(
        `Категория карточек с id ${dto.categoryId} не найдена`,
      );
    }
    const card = await prisma.card.create({
      data: {
        categoryId: dto.categoryId,
        question: dto.question,
        answer: dto.answer,
        difficulty: dto.difficulty,
      },
    });
    return toCardResponseDto(card);
  }
}
