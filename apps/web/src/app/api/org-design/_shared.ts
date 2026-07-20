import { NextResponse } from 'next/server';

export type Permissions = string[];

export interface RouteContext {
  user: { userId: string; tenantId: string };
  permissions: Permissions;
}

export const ok = (data: unknown, status = 200) =>
  NextResponse.json({ success: true, data }, { status });

export const created = (data: unknown) => ok(data, 201);

export const fail = (
  code: string,
  message: string,
  messageAr: string,
  status: number,
  details?: unknown
) =>
  NextResponse.json(
    { success: false, error: { code, message, messageAr, ...(details ? { details } : {}) } },
    { status }
  );

export const forbidden = () =>
  fail('E4030', 'Forbidden: insufficient permissions', 'ممنوع: صلاحيات غير كافية', 403);

export const badRequest = (message: string, messageAr = 'طلب غير صالح', details?: unknown) =>
  fail('E2001', message, messageAr, 400, details);

export const notFound = (message = 'Resource not found', messageAr = 'المورد غير موجود') =>
  fail('E4040', message, messageAr, 404);

export const serverError = (message: string, err: unknown) =>
  fail('E5001', message, 'خطأ في الخادم', 500, {
    error: err instanceof Error ? err.message : 'Unknown error',
  });

export function hasAny(perms: Permissions, ...needed: string[]) {
  return needed.some((p) => perms.includes(p));
}
