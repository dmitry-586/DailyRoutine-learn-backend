import { ApiProperty } from '@nestjs/swagger';

export class SubchapterResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  chapterId!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  order!: number;
}
