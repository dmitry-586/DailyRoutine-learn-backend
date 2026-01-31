import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { RequestUser } from '../strategies/jwt.strategy.js';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestUser => {
    const request = ctx.switchToHttp().getRequest<{ user?: RequestUser }>();
    const user = request.user;
    if (!user) {
      throw new UnauthorizedException(
        'CurrentUser доступен только на защищённых маршрутах (JwtAuthGuard)',
      );
    }
    return user;
  },
);
