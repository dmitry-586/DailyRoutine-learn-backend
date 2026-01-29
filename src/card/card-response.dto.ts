import { ApiProperty } from '@nestjs/swagger';
import { CARD_DIFFICULTY_VALUES } from './card-request.dto.js';

export class CardResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  categoryId!: string;

  @ApiProperty()
  question!: string;

  @ApiProperty()
  answer!: string;

  @ApiProperty({ enum: CARD_DIFFICULTY_VALUES })
  difficulty!: string;
}
