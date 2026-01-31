import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { Role } from '../../../generated/prisma/client.js';
import { JWT_SECRET } from '../auth.constants.js';
import { getAccessTokenFromRequest } from '../helpers/index.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface RequestUser {
  id: string;
  email: string;
  role: Role;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: getAccessTokenFromRequest,
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  validate(payload: JwtPayload): RequestUser {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
