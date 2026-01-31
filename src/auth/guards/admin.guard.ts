import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { RequestUser } from '../strategies/jwt.strategy.js';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: RequestUser }>();
    const user = request.user;
    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenException('Доступ только для администратора');
    }
    return true;
  }
}
