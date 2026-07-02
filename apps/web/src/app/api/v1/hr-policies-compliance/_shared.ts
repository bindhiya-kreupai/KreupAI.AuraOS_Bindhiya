import { NextResponse } from 'next/server';

// Success helpers + permission check reuse the shared GCC implementation.
export { ok, created, hasAny } from '../gcc-landscape/_shared';
export type { Permissions, RouteContext } from '../gcc-landscape/_shared';

/**
 * Bilingual error envelope. Every error JSON carries both `message` (English)
 * and `messageAr` (Arabic) per the AuraOS bilingual API requirement, in
 * addition to the shared `error` object used across the GCC family.
 */
export const fail = (
  code: string,
  message: string,
  messageAr: string,
  status: number,
  details?: unknown
) =>
  NextResponse.json(
    {
      success: false,
      message,
      messageAr,
      error: { code, message, messageAr, ...(details ? { details } : {}) },
    },
    { status }
  );

export const forbidden = () => fail('E4030', 'Forbidden', 'غير مسموح', 403);

export const badRequest = (msg: string, msgAr?: string, details?: unknown) =>
  fail('E2001', msg, msgAr ?? 'طلب غير صالح', 400, details);

export const serverError = (msg: string, err: unknown, msgAr?: string) =>
  fail('E5001', msg, msgAr ?? 'حدث خطأ في الخادم', 500, {
    error: err instanceof Error ? err.message : 'Unknown error',
  });
