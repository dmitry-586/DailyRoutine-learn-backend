import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { Role, User } from '../../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import {
  ACCESS_EXPIRES_SEC,
  REFRESH_EXPIRES_SEC,
  REFRESH_ROTATION_THRESHOLD_SEC,
  SALT_ROUNDS,
} from './auth.constants.js';
import type { LoginDto, RegisterDto, UserPayloadDto } from './dto/index.js';

type TokenPayload = { sub: string; email: string; role: Role };

export interface AuthTokensResult {
  accessToken: string;
  refreshToken: string;
  user: UserPayloadDto;
}

function toUserPayload(user: User): UserPayloadDto {
  return { id: user.id, email: user.email, role: user.role };
}

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return null;
    }
    return user;
  }

  async login(dto: LoginDto): Promise<AuthTokensResult> {
    const user = await this.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }
    return this.issueTokens(user);
  }

  async register(dto: RegisterDto): Promise<AuthTokensResult> {
    const email = dto.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: dto.name ?? null,
      },
    });
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthTokensResult> {
    const tokenPrefix = refreshToken.slice(0, 16);
    try {
      try {
        // Проверяем подпись и срок жизни refresh token, но не используем его payload напрямую,
        // чтобы не тащить в новый access уже существующее поле exp.
        this.jwtService.verify<TokenPayload>(refreshToken);
      } catch {
        throw new UnauthorizedException(
          'Невалидный или истёкший refresh token',
        );
      }

      const stored = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!stored) {
        // Это типичный кейс: токен не найден в БД
        throw new UnauthorizedException('Refresh token не найден');
      }

      if (!stored.user) {
        // Защита от потенциально "битых" данных, иначе будет 500 на доступе к user.*
        throw new UnauthorizedException(
          'Пользователь, связанный с refresh token, не найден',
        );
      }

      const expiresAtTime = stored.expiresAt?.getTime();
      if (!expiresAtTime || Number.isNaN(expiresAtTime)) {
        // Если expiresAt в БД в неверном формате — явно сообщаем, а не падаем с 500
        throw new UnauthorizedException(
          'Некорректная дата истечения refresh token',
        );
      }

      if (stored.revoked || expiresAtTime < Date.now()) {
        throw new UnauthorizedException(
          'Refresh token недействителен или отозван',
        );
      }

      const timeLeftSec = (expiresAtTime - Date.now()) / 1000;
      if (timeLeftSec <= REFRESH_ROTATION_THRESHOLD_SEC) {
        await prisma.refreshToken.update({
          where: { id: stored.id },
          data: { revoked: true },
        });
        return this.issueTokens(stored.user);
      }

      const payload: TokenPayload = {
        sub: stored.user.id,
        email: stored.user.email,
        role: stored.user.role,
      };

      const accessToken = this.jwtService.sign(payload, {
        expiresIn: ACCESS_EXPIRES_SEC,
      });

      return {
        accessToken,
        refreshToken,
        user: toUserPayload(stored.user),
      };
    } catch (error) {
      // Логируем причину, чтобы увидеть реальную ошибку на сервере
      // Не логируем токен целиком — только префикс

      console.error(
        '[AuthService.refresh] Ошибка при обновлении токена',
        tokenPrefix,
        error,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async revokeRefreshToken(refreshToken: string | null): Promise<void> {
    if (!refreshToken) return;
    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    if (stored && !stored.revoked) {
      await prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revoked: true },
      });
    }
  }

  private async issueTokens(user: User): Promise<AuthTokensResult> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: ACCESS_EXPIRES_SEC,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: REFRESH_EXPIRES_SEC,
    });
    const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_SEC * 1000);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });
    return {
      accessToken,
      refreshToken,
      user: toUserPayload(user),
    };
  }
}
