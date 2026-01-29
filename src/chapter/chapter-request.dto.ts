import { ApiProperty } from '@nestjs/swagger';

export class CreateChapterDto {
  @ApiProperty({ description: 'ID части курса' })
  partId!: string;

  @ApiProperty({ description: 'Название главы' })
  title!: string;

  @ApiProperty({ description: 'Порядок в части' })
  order!: number;
}
