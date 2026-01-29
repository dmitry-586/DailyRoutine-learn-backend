import { ApiProperty } from '@nestjs/swagger';

export class CreateCardCategoryDto {
  @ApiProperty({ description: 'Название категории карточек' })
  title!: string;

  @ApiProperty({ description: 'Порядок отображения', default: 0 })
  order!: number;
}
