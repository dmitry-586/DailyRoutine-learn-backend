import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsString, MinLength } from 'class-validator';
import { Trim } from '../auth/decorators/trim.decorator.js';

export class CreateCardCategoryDto {
  @ApiProperty({ description: 'Название категории карточек' })
  @IsString({ message: 'Название должно быть строкой' })
  @MinLength(1, { message: 'Название не может быть пустым' })
  @Trim()
  title!: string;

  @ApiProperty({ description: 'Порядок отображения', default: 0 })
  @IsNumber({}, { message: 'Порядок должен быть числом' })
  order!: number;
}

export class UpdateCardCategoryDto extends PartialType(CreateCardCategoryDto) {}
