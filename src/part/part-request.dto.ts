import { ApiProperty } from '@nestjs/swagger';

export class CreatePartDto {
  @ApiProperty({ description: 'Название части' })
  title!: string;

  @ApiProperty({ description: 'Порядок частей' })
  order!: number;
}
