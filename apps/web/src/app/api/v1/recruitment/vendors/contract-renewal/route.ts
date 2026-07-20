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
const vendorContractRenewal = (prisma as any).vendorContractRenewal;

/** GET /api/v1/recruitment/vendors/contract-renewal — tenant-scoped list with vendor names. */
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
      vendorContractRenewal.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      vendorContractRenewal.count({ where }),
    ]);

    const vendorIds = Array.from(new Set(rows.map((r: { vendorId: string }) => r.vendorId)));
    const vendors = vendorIds.length
      ? await prisma.recruitmentVendor.findMany({
          where: { id: { in: vendorIds as string[] }, tenantId: user.tenantId },
          select: { id: true, name: true, vendorCode: true },
        })
      : [];
    const vendorById = new Map(vendors.map((v) => [v.id, v]));
    const items = rows.map((r: { vendorId: string }) => ({
      ...r,
      vendorName: vendorById.get(r.vendorId)?.name ?? null,
      vendorCode: vendorById.get(r.vendorId)?.vendorCode ?? null,
    }));

    return listResponse(items, total, page, pageSize);
  } catch (error) {
    console.error('[Vendor Contract Renewal API] GET Error:', error);
    return serverError('vendor contract renewals');
  }
});

/** POST /api/v1/recruitment/vendors/contract-renewal — raise a renewal for a vendor. */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('recruitment:create')) return forbidden('create');

    const body = await request.json();
    if (!body?.vendorId) return badRequest('vendorId is required', 'معرّف المورّد مطلوب');
    if (!(await assertVendor(user.tenantId, body.vendorId))) {
      return notFound('Vendor not found', 'المورّد غير موجود');
    }

    const created = await vendorContractRenewal.create({
      data: {
        tenantId: user.tenantId,
        vendorId: body.vendorId,
        currentEndDate: toDate(body.currentEndDate),
        proposedEndDate: toDate(body.proposedEndDate),
        status: body.status ?? 'pending',
        decision: body.decision ?? null,
        decisionNotes: body.decisionNotes ?? null,
        createdBy: user.id,
        updatedBy: user.id,
      },
    });

    return ok(created, 201, 'Renewal raised successfully');
  } catch (error) {
    console.error('[Vendor Contract Renewal API] POST Error:', error);
    return serverError('vendor contract renewal');
  }
});
