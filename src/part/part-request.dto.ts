import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsString, MinLength } from 'class-validator';

export class CreatePartDto {
  @ApiProperty({ description: 'Название части' })
  @IsString({ message: 'Название должно быть строкой' })
  @MinLength(1, { message: 'Название не может быть пустым' })
  title!: string;

  @ApiProperty({ description: 'Порядок частей' })
  @IsNumber({}, { message: 'Порядок должен быть числом' })
  order!: number;
}

export class UpdatePartDto extends PartialType(CreatePartDto) {}
