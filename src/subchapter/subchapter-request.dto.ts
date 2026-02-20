import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID, MinLength } from 'class-validator';
import { Trim } from '../auth/decorators/trim.decorator.js';

export class CreateSubchapterDto {
  @ApiProperty({ description: 'ID главы' })
  @IsUUID(4, { message: 'ID главы должен быть валидным UUID' })
  chapterId!: string;

  @ApiProperty({ description: 'Заголовок подраздела' })
  @IsString({ message: 'Заголовок должен быть строкой' })
  @MinLength(1, { message: 'Заголовок не может быть пустым' })
  @Trim()
  title!: string;

  @ApiProperty({ description: 'Текст материала' })
  @IsString({ message: 'Описание должно быть строкой' })
  @MinLength(1, { message: 'Описание не может быть пустым' })
  @Trim()
  description!: string;

  @ApiProperty({ description: 'Порядок в главе' })
  @IsNumber({}, { message: 'Порядок должен быть числом' })
  order!: number;
}

export class UpdateSubchapterDto extends PartialType(CreateSubchapterDto) {}
