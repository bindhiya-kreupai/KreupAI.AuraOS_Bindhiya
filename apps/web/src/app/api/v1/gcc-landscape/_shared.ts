import { NextResponse } from 'next/server';

export type Permissions = string[];

export interface RouteContext {
  user: { id: string; tenantId: string };
  permissions: Permissions;
  roles: string[];
}

export const ok = (data: unknown, message?: string, status = 200) =>
  NextResponse.json({ success: true, data, ...(message ? { message } : {}) }, { status });

export const created = (data: unknown, message = 'Created') => ok(data, message, 201);

export const fail = (code: string, message: string, status: number, details?: unknown) =>
  NextResponse.json(
    { success: false, error: { code, message, ...(details ? { details } : {}) } },
    { status }
  );

export const forbidden = () => fail('E4030', 'Forbidden', 403);
export const badRequest = (msg: string, details?: unknown) => fail('E2001', msg, 400, details);
export const serverError = (msg: string, err: unknown) => {
  console.error('[API Server Error]:', msg, err);
  return fail('E5001', msg, 500, {
    error: err instanceof Error ? err.message : 'Unknown error',
    stack: err instanceof Error ? err.stack : undefined,
  });
};

export function hasAny(perms: Permissions, ...needed: string[]) {
  return needed.some((p) => perms.includes(p));
}
