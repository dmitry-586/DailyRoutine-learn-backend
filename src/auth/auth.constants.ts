export const ACCESS_TOKEN_COOKIE = 'accessToken';
export const REFRESH_TOKEN_COOKIE = 'refreshToken';

export const JWT_SECRET =
  process.env.JWT_SECRET ?? 'dev-secret-change-in-production';
export const ACCESS_EXPIRES_SEC = Number(process.env.JWT_ACCESS_EXPIRES) || 900;
export const REFRESH_EXPIRES_SEC =
  Number(process.env.JWT_REFRESH_EXPIRES) || 604800;

/** Ротация refresh: новый refresh выдаём только если до истечения осталось меньше этого (сек). Иначе только новый access. */
export const REFRESH_ROTATION_THRESHOLD_SEC =
  Number(process.env.JWT_REFRESH_ROTATION_THRESHOLD) || 172800; // 2 дня

export const SALT_ROUNDS = 10;

const isProduction = process.env.NODE_ENV === 'production';

export type CookieOptions = {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: '/';
  maxAge: number;
};

function baseCookieOptions(maxAge: number): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    maxAge,
  };
}

export function getAccessCookieOptions(): CookieOptions {
  return baseCookieOptions(ACCESS_EXPIRES_SEC * 1000);
}

export function getRefreshCookieOptions(): CookieOptions {
  return baseCookieOptions(REFRESH_EXPIRES_SEC * 1000);
}

export function getClearCookieOptions(): CookieOptions {
  return baseCookieOptions(0);
}
