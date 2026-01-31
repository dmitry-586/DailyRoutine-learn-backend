import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ACCESS_EXPIRES_SEC, JWT_SECRET } from './auth.constants.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AdminGuard } from './guards/admin.guard.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: ACCESS_EXPIRES_SEC },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, AdminGuard],
  exports: [AuthService, JwtModule, JwtAuthGuard, AdminGuard],
})
export class AuthModule {}
