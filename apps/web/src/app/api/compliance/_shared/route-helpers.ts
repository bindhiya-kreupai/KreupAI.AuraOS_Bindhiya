/**
 * Shared helpers for Compliance / Labor-Relations CRUD API routes.
 *
 * All labor-relations tables are new models accessed via (prisma as any).
 * These helpers keep the routes DRY while enforcing:
 *  - tenant scoping (tenantId always injected from auth context)
 *  - bilingual error envelopes ({ message, messageAr })
 *  - the shared list response shape { items, total, page, pageSize, hasNextPage }
 */

import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

export interface BilingualError {
  message: string;
  messageAr: string;
}

export function errorResponse(err: BilingualError, status = 500): NextResponse {
  return NextResponse.json({ success: false, error: err.message, ...err }, { status });
}

export const ERR = {
  unauthorized: { message: 'Unauthorized', messageAr: 'غير مصرح' },
  notFound: { message: 'Record not found', messageAr: 'السجل غير موجود' },
  badRequest: { message: 'Invalid request payload', messageAr: 'حمولة الطلب غير صالحة' },
  server: { message: 'Internal server error', messageAr: 'خطأ داخلي في الخادم' },
} as const;

/** Parse page/pageSize from a URL, clamped to sane bounds. */
export function parsePaging(url: string): { page: number; pageSize: number; skip: number } {
  const params = new URL(url).searchParams;
  const page = Math.max(1, parseInt(params.get('page') || '1', 10) || 1);
  const pageSize = Math.min(200, Math.max(1, parseInt(params.get('pageSize') || '50', 10) || 50));
  return { page, pageSize, skip: (page - 1) * pageSize };
}

export function listShape<T>(items: T[], total: number, page: number, pageSize: number) {
  return {
    items,
    total,
    page,
    pageSize,
    hasNextPage: page * pageSize < total,
  };
}

/** Generate a human-friendly sequential-ish code, e.g. GRV-2026-8F3A2. */
export function genCode(prefix: string): string {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${year}-${rand}`;
}

/** Access a new (non-typed) model delegate. */
export function model(name: string): any {
  return (prisma as any)[name];
}
