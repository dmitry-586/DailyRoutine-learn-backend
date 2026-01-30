import { ApiProperty, PartialType } from '@nestjs/swagger';

export const CARD_DIFFICULTY_VALUES = ['EASY', 'MEDIUM', 'HARD'] as const;
export type CardDifficulty = (typeof CARD_DIFFICULTY_VALUES)[number];

export class CreateCardDto {
  @ApiProperty({ description: 'ID категории карточек' })
  categoryId!: string;

  @ApiProperty({ description: 'Вопрос на карточке' })
  question!: string;

  @ApiProperty({ description: 'Ответ на карточке' })
  answer!: string;

  @ApiProperty({
    description: 'Сложность карточки',
    enum: CARD_DIFFICULTY_VALUES,
    default: 'MEDIUM',
  })
  difficulty!: CardDifficulty;
}

export class UpdateCardDto extends PartialType(CreateCardDto) {}
