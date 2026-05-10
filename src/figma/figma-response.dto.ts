import { ApiProperty } from '@nestjs/swagger';

export class FigmaSectionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  chapterId!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  content!: string;

  @ApiProperty()
  order!: number;
}

export class FigmaChapterResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  order!: number;

  @ApiProperty({ type: [FigmaSectionResponseDto] })
  sections!: FigmaSectionResponseDto[];
}

export class FigmaMediaResponseDto {
  @ApiProperty()
  url!: string;
}
