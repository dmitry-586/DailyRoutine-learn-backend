import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { Trim } from '../auth/decorators/trim.decorator.js';

export class CreateFigmaChapterDto {
  @ApiProperty({ description: 'Название главы Figma-методички' })
  @IsString({ message: 'Название должно быть строкой' })
  @MinLength(1, { message: 'Название не может быть пустым' })
  @Trim()
  title!: string;

  @ApiProperty({ description: 'Порядок главы' })
  @IsNumber({}, { message: 'Порядок должен быть числом' })
  order!: number;
}

export class UpdateFigmaChapterDto extends PartialType(CreateFigmaChapterDto) {}

export class CreateFigmaSectionDto {
  @ApiProperty({ description: 'ID главы Figma-методички' })
  @IsUUID(4, { message: 'ID главы должен быть валидным UUID' })
  chapterId!: string;

  @ApiProperty({ description: 'Заголовок раздела', required: false })
  @IsOptional()
  @IsString({ message: 'Заголовок должен быть строкой' })
  @Trim()
  title?: string;

  @ApiProperty({ description: 'Markdown-текст раздела' })
  @IsString({ message: 'Текст должен быть строкой' })
  @MinLength(1, { message: 'Текст не может быть пустым' })
  @Trim()
  content!: string;

  @ApiProperty({ description: 'Порядок раздела в главе' })
  @IsNumber({}, { message: 'Порядок должен быть числом' })
  order!: number;
}

export class UpdateFigmaSectionDto extends PartialType(CreateFigmaSectionDto) {}
