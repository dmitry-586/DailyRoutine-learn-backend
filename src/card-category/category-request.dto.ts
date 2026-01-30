import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateCardCategoryDto {
  @ApiProperty({ description: 'Название категории карточек' })
  title!: string;

  @ApiProperty({ description: 'Порядок отображения', default: 0 })
  order!: number;
}

export class UpdateCardCategoryDto extends PartialType(CreateCardCategoryDto) {}
