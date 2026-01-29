import { ApiProperty } from '@nestjs/swagger';

export class CardCategoryResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  order!: number;
}
