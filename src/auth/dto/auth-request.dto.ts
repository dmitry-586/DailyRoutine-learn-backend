import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { Trim } from '../decorators/trim.decorator.js';

export class LoginDto {
  @ApiProperty({
    description: 'Email пользователя',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Некорректный формат email' })
  @Trim()
  email!: string;

  @ApiProperty({ description: 'Пароль' })
  @IsString()
  @MinLength(1, { message: 'Пароль не может быть пустым' })
  password!: string;
}

export class RegisterDto {
  @ApiProperty({
    description: 'Email пользователя',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Некорректный формат email' })
  @Trim()
  email!: string;

  @ApiProperty({ description: 'Пароль' })
  @IsString()
  @MinLength(6, { message: 'Пароль должен быть не короче 6 символов' })
  password!: string;

  @ApiProperty({ description: 'Имя (опционально)', required: false })
  @IsOptional()
  @IsString()
  @Trim()
  name?: string;
}
