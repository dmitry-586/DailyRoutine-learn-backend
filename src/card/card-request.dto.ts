import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID, MinLength } from 'class-validator';
import { Trim } from '../auth/decorators/trim.decorator.js';

export const CARD_DIFFICULTY_VALUES = ['EASY', 'MEDIUM', 'HARD'] as const;
export type CardDifficulty = (typeof CARD_DIFFICULTY_VALUES)[number];

export class CreateCardDto {
  @ApiProperty({ description: 'ID категории карточек' })
  @IsUUID(4, { message: 'ID категории должен быть валидным UUID' })
  categoryId!: string;

  @ApiProperty({ description: 'Вопрос на карточке' })
  @IsString({ message: 'Вопрос должен быть строкой' })
  @MinLength(1, { message: 'Вопрос не может быть пустым' })
  @Trim()
  question!: string;

  @ApiProperty({ description: 'Ответ на карточке' })
  @IsString({ message: 'Ответ должен быть строкой' })
  @MinLength(1, { message: 'Ответ не может быть пустым' })
  @Trim()
  answer!: string;

  @ApiProperty({
    description: 'Сложность карточки',
    enum: CARD_DIFFICULTY_VALUES,
    default: 'MEDIUM',
  })
  @IsEnum(CARD_DIFFICULTY_VALUES, {
    message: 'Сложность должна быть одним из значений: EASY, MEDIUM, HARD',
  })
  difficulty!: CardDifficulty;
}

export class UpdateCardDto extends PartialType(CreateCardDto) {}
