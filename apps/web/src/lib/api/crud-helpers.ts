/**
 * Generic CRUD helpers for routes that just need list / get-by-id / create /
 * update / delete against a tenant-scoped Prisma model. Each module-specific
 * route still gets its own file with the right auth, validation, and
 * permission checks — this file just removes the boilerplate.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function parsePagination(searchParams: URLSearchParams): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = Math.min(200, Math.max(1, Number(searchParams.get('limit')) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

export function successList<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
  extra?: Record<string, unknown>
) {
  const totalPages = Math.ceil(total / limit);
  return NextResponse.json({
    success: true,
    data,
    meta: {
      pagination: { page, limit, total, totalPages } as Pagination,
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
      ...(extra || {}),
    },
  });
}

export function successItem<T>(data: T, init?: { status?: number; headers?: HeadersInit }) {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    },
    init
  );
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
  details?: unknown,
  messageAr?: string
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(messageAr ? { messageAr } : {}),
        ...(details ? { details } : {}),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
    },
    { status }
  );
}

export function notFound(resource: string) {
  return errorResponse('E2001', `${resource} not found`, 404);
}

export function validationError(details: unknown) {
  return errorResponse('E2001', 'Validation failed', 400, details);
}

export function forbidden(permission: string) {
  return errorResponse(
    'E4030',
    `Forbidden: missing ${permission} permission`,
    403,
    undefined,
    'ممنوع'
  );
}

export function serverError(error: any, op: string) {
  return errorResponse(
    'E5001',
    `Failed to ${op}`,
    500,
    error instanceof Error ? { error: error.message } : undefined
  );
}

export async function safeJson(request: NextRequest): Promise<Record<string, any> | null> {
  try {
    return (await request.json()) as Record<string, any>;
  } catch {
    return null;
  }
}
