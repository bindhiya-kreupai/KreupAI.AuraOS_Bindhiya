import type { NextResponse } from 'next/server';

export const ACCESS_COOKIE = 'auraos.access';
export const REFRESH_COOKIE = 'auraos.refresh';

const ACCESS_MAX_AGE = 60 * 60 * 24; // 24h — matches JWT_EXPIRES_IN default
const REFRESH_MAX_AGE = 60 * 60 * 24 * 7; // 7d — matches JWT_REFRESH_EXPIRES_IN default

const isProd = process.env.NODE_ENV === 'production';

export function setAuthCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string }
): void {
  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_MAX_AGE,
  });
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_MAX_AGE,
  });
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(ACCESS_COOKIE, '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  response.cookies.set(REFRESH_COOKIE, '', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
