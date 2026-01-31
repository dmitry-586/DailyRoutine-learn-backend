import { ApiProperty } from '@nestjs/swagger';

export const ROLE_VALUES = ['USER', 'ADMIN'] as const;
export type RoleDto = (typeof ROLE_VALUES)[number];

export class UserPayloadDto {
  @ApiProperty()
  id!: string;

  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ enum: ROLE_VALUES })
  role!: RoleDto;
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'Данные пользователя (токены передаются в HttpOnly cookies)',
    type: UserPayloadDto,
  })
  user!: UserPayloadDto;
}
