import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID, MinLength } from 'class-validator';
import { Trim } from '../auth/decorators/trim.decorator.js';

export class CreateChapterDto {
  @ApiProperty({ description: 'ID части курса' })
  @IsUUID(4, { message: 'ID части должен быть валидным UUID' })
  partId!: string;

  @ApiProperty({ description: 'Название главы' })
  @IsString({ message: 'Название должно быть строкой' })
  @MinLength(1, { message: 'Название не может быть пустым' })
  @Trim()
  title!: string;

  @ApiProperty({ description: 'Порядок в части' })
  @IsNumber({}, { message: 'Порядок должен быть числом' })
  order!: number;
}

export class UpdateChapterDto extends PartialType(CreateChapterDto) {}
