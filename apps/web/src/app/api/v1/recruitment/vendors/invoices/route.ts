import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import {
  assertVendor,
  badRequest,
  forbidden,
  listResponse,
  notFound,
  ok,
  parsePaging,
  serverError,
  toDate,
} from '../_lib/vendor-subdomain';

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const vendorInvoice = (prisma as any).vendorInvoice;

/** GET /api/v1/recruitment/vendors/invoices — tenant-scoped invoices with vendor names. */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('recruitment:read')) return forbidden('read');

    const { page, pageSize, skip, searchParams } = parsePaging(request);
    const vendorId = searchParams.get('vendorId') || undefined;
    const status = searchParams.get('status') || undefined;

    const where: Record<string, unknown> = { tenantId: user.tenantId, isDeleted: false };
    if (vendorId) where.vendorId = vendorId;
    if (status) where.status = status;

    const [rows, total] = await Promise.all([
      vendorInvoice.findMany({ where, skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
      vendorInvoice.count({ where }),
    ]);

    const vendorIds = Array.from(new Set(rows.map((r: { vendorId: string }) => r.vendorId)));
    const vendors = vendorIds.length
      ? await prisma.recruitmentVendor.findMany({
          where: { id: { in: vendorIds as string[] }, tenantId: user.tenantId },
          select: { id: true, name: true },
        })
      : [];
    const vendorById = new Map(vendors.map((v) => [v.id, v]));
    const items = rows.map((r: { vendorId: string }) => ({
      ...r,
      vendorName: vendorById.get(r.vendorId)?.name ?? null,
    }));

    return listResponse(items, total, page, pageSize);
  } catch (error) {
    console.error('[Vendor Invoices API] GET Error:', error);
    return serverError('vendor invoices');
  }
});

/** POST /api/v1/recruitment/vendors/invoices — register a vendor invoice. */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('recruitment:create')) return forbidden('create');

    const body = await request.json();
    if (!body?.vendorId || !body?.invoiceNumber) {
      return badRequest(
        'vendorId and invoiceNumber are required',
        'معرّف المورّد ورقم الفاتورة مطلوبان'
      );
    }
    if (!(await assertVendor(user.tenantId, body.vendorId))) {
      return notFound('Vendor not found', 'المورّد غير موجود');
    }

    const created = await vendorInvoice.create({
      data: {
        tenantId: user.tenantId,
        vendorId: body.vendorId,
        invoiceNumber: String(body.invoiceNumber),
        invoiceDate: toDate(body.invoiceDate),
        dueDate: toDate(body.dueDate),
        amount: Number(body.amount ?? 0),
        currency: body.currency ?? 'USD',
        status: body.status ?? 'pending',
        description: body.description ?? null,
        createdBy: user.id,
        updatedBy: user.id,
      },
    });

    return ok(created, 201, 'Invoice registered successfully');
  } catch (error) {
    console.error('[Vendor Invoices API] POST Error:', error);
    return serverError('vendor invoice');
  }
});
