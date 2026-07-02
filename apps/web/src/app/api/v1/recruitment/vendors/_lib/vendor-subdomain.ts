import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';

/**
 * Shared helpers for recruitment vendor sub-domain APIs (compliance docs,
 * contract types, renewals, rate cards, performance reviews, invoices,
 * timesheets). Every helper is tenant-scoped and enforces bilingual errors.
 */

export function forbidden(action: 'read' | 'create' | 'update') {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'E4030',
        message: `Forbidden: missing recruitment:${action} permission`,
        messageAr: 'ممنوع: الصلاحية المطلوبة مفقودة',
      },
    },
    { status: 403 }
  );
}

export function badRequest(message: string, messageAr: string) {
  return NextResponse.json(
    { success: false, error: { code: 'E2001', message, messageAr } },
    { status: 400 }
  );
}

export function notFound(message: string, messageAr: string) {
  return NextResponse.json(
    { success: false, error: { code: 'E4004', message, messageAr } },
    { status: 404 }
  );
}

export function serverError(scope: string) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: 'E5001',
        message: `Failed to process ${scope}`,
        messageAr: 'فشل في معالجة الطلب',
      },
    },
    { status: 500 }
  );
}

export function ok(data: unknown, status = 200, message?: string) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message ? { message } : {}),
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    },
    { status }
  );
}

export function listResponse(items: unknown[], total: number, page: number, pageSize: number) {
  return NextResponse.json({
    success: true,
    data: {
      items,
      total,
      page,
      pageSize,
      hasNextPage: page * pageSize < total,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: crypto.randomUUID(),
      apiVersion: 'v1',
    },
  });
}

export function parsePaging(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10) || 1, 1);
  const pageSize = Math.min(
    Math.max(parseInt(searchParams.get('pageSize') || '50', 10) || 50, 1),
    100
  );
  return { page, pageSize, skip: (page - 1) * pageSize, searchParams };
}

/** Verify the vendor exists and belongs to the tenant. Returns the vendor id or null. */
export async function assertVendor(tenantId: string, vendorId: string): Promise<boolean> {
  if (!vendorId) return false;
  const vendor = await prisma.recruitmentVendor.findFirst({
    where: { id: vendorId, tenantId },
    select: { id: true },
  });
  return Boolean(vendor);
}

export function toDate(value: unknown): Date | null {
  if (!value) return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
}
