import { NextResponse } from 'next/server';

/**
 * Shared helpers for the DEI API surface.
 * Bilingual (en/ar) error envelopes matching repo conventions.
 */

export function deiError(
  message: string,
  messageAr: string,
  status: number,
  code = 'E_DEI'
): NextResponse {
  return NextResponse.json({ success: false, error: { code, message, messageAr } }, { status });
}

export const DEI_ERRORS = {
  forbidden: () => deiError('Forbidden', 'غير مصرح', 403, 'E4030'),
  notFound: (what = 'Resource') => deiError(`${what} not found`, 'المورد غير موجود', 404, 'E4040'),
  badRequest: (message = 'Invalid request', messageAr = 'طلب غير صالح') =>
    deiError(message, messageAr, 400, 'E4000'),
  server: (message = 'Internal server error', messageAr = 'خطأ في الخادم') =>
    deiError(message, messageAr, 500, 'E5000'),
} as const;
