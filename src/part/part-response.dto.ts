import { ApiProperty } from '@nestjs/swagger';

export class PartChapterItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  order!: number;
}

export class PartResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  order!: number;

  @ApiProperty({ type: [PartChapterItemDto] })
  chapters!: PartChapterItemDto[];
}
