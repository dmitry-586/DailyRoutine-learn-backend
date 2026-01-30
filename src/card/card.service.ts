import { Injectable, NotFoundException } from '@nestjs/common';
import type { Card } from '../../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import type {
  CardDifficulty,
  CreateCardDto,
  UpdateCardDto,
} from './card-request.dto.js';
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

  async update(id: string, dto: UpdateCardDto): Promise<CardResponseDto> {
    const existing = await prisma.card.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Карточка с id ${id} не найдена`);
    }
    if (dto.categoryId !== undefined) {
      const category = await prisma.cardCategory.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `Категория карточек с id ${dto.categoryId} не найдена`,
        );
      }
    }
    const data: {
      categoryId?: string;
      question?: string;
      answer?: string;
      difficulty?: CardDifficulty;
    } = {};
    if (dto.categoryId !== undefined) data.categoryId = dto.categoryId;
    if (dto.question !== undefined) data.question = dto.question;
    if (dto.answer !== undefined) data.answer = dto.answer;
    if (dto.difficulty !== undefined) data.difficulty = dto.difficulty;
    if (Object.keys(data).length === 0) {
      return toCardResponseDto(existing);
    }
    const card = await prisma.card.update({
      where: { id },
      data,
    });
    return toCardResponseDto(card);
  }
}
