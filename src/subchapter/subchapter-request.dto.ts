import { ApiProperty } from '@nestjs/swagger';

export class CreateSubchapterDto {
  @ApiProperty({ description: 'ID главы' })
  chapterId!: string;

  @ApiProperty({ description: 'Заголовок подраздела' })
  title!: string;

  @ApiProperty({ description: 'Текст материала' })
  description!: string;

  @ApiProperty({ description: 'Порядок в главе' })
  order!: number;
}
