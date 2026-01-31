import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { CurrentUser } from './decorators/index.js';
import { AuthResponseDto, LoginDto, RegisterDto } from './dto/index.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import {
  clearTokenCookies,
  getRefreshTokenFromRequest,
  setTokenCookies,
} from './helpers/index.js';
import type { RequestUser } from './strategies/jwt.strategy.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Данные текущего пользователя' })
  @ApiOkResponse({
    description: 'Текущий пользователь (id, email, role)',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Не авторизован' })
  me(@CurrentUser() user: RequestUser): AuthResponseDto {
    return { user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход по email и паролю' })
  @ApiOkResponse({
    description: 'Успешный вход, токены в HttpOnly cookies',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Неверный email или пароль' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.login(dto);
    setTokenCookies(res, result.accessToken, result.refreshToken);
    return { user: result.user };
  }

  @Post('register')
  @ApiOperation({
    summary: 'Регистрация по email и паролю (без проверки почты)',
  })
  @ApiCreatedResponse({
    description: 'Пользователь создан, токены в HttpOnly cookies',
    type: AuthResponseDto,
  })
  @ApiConflictResponse({
    description: 'Пользователь с таким email уже существует',
  })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.register(dto);
    setTokenCookies(res, result.accessToken, result.refreshToken);
    return { user: result.user };
  }

  @Post('refresh')
  @ApiOperation({
    summary: 'Обмен refresh token (из cookie) на новую пару access + refresh',
  })
  @ApiCreatedResponse({
    description: 'Новые токены в HttpOnly cookies',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Невалидный или отозванный refresh token',
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const refreshToken = getRefreshTokenFromRequest(req);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token отсутствует');
    }
    const result = await this.authService.refresh(refreshToken);
    setTokenCookies(res, result.accessToken, result.refreshToken);
    return { user: result.user };
  }

  @Post('logout')
  @ApiOperation({
    summary: 'Выход — отзыв refresh token в БД и очистка cookies',
  })
  @ApiOkResponse({ description: 'Refresh отозван, cookies очищены' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: true }> {
    const refreshToken = getRefreshTokenFromRequest(req) ?? null;
    await this.authService.revokeRefreshToken(refreshToken);
    clearTokenCookies(res);
    return { ok: true };
  }
}
