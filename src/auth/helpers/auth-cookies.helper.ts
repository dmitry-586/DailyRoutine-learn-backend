import type { Request, Response } from 'express';
import {
  ACCESS_TOKEN_COOKIE,
  getAccessCookieOptions,
  getClearCookieOptions,
  getRefreshCookieOptions,
  REFRESH_TOKEN_COOKIE,
} from '../auth.constants.js';

type CookiesRecord = Record<string, string> | undefined;

export function getCookie(req: Request, name: string): string | null {
  const cookies = req.cookies as CookiesRecord;
  return cookies?.[name] ?? null;
}

export function getRefreshTokenFromRequest(req: Request): string | null {
  return getCookie(req, REFRESH_TOKEN_COOKIE);
}

export function getAccessTokenFromRequest(req: Request): string | null {
  return getCookie(req, ACCESS_TOKEN_COOKIE);
}

export function setTokenCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
): void {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, getAccessCookieOptions());
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, getRefreshCookieOptions());
}

export function clearTokenCookies(res: Response): void {
  const options = getClearCookieOptions();
  res.cookie(ACCESS_TOKEN_COOKIE, '', options);
  res.cookie(REFRESH_TOKEN_COOKIE, '', options);
}
