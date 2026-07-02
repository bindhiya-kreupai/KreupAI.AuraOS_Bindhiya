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
const vendorTimesheet = (prisma as any).vendorTimesheet;

/** GET /api/v1/recruitment/vendors/timesheets — tenant-scoped timesheets with vendor names. */
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
      vendorTimesheet.findMany({ where, skip, take: pageSize, orderBy: { createdAt: 'desc' } }),
      vendorTimesheet.count({ where }),
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
    console.error('[Vendor Timesheets API] GET Error:', error);
    return serverError('vendor timesheets');
  }
});

/** POST /api/v1/recruitment/vendors/timesheets — submit a contractor timesheet. */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('recruitment:create')) return forbidden('create');

    const body = await request.json();
    if (!body?.vendorId || !body?.workerName) {
      return badRequest(
        'vendorId and workerName are required',
        'معرّف المورّد واسم العامل مطلوبان'
      );
    }
    if (!(await assertVendor(user.tenantId, body.vendorId))) {
      return notFound('Vendor not found', 'المورّد غير موجود');
    }

    const created = await vendorTimesheet.create({
      data: {
        tenantId: user.tenantId,
        vendorId: body.vendorId,
        workerName: String(body.workerName),
        periodStart: toDate(body.periodStart),
        periodEnd: toDate(body.periodEnd),
        hours: Number(body.hours ?? 0),
        status: body.status ?? 'submitted',
        notes: body.notes ?? null,
        createdBy: user.id,
        updatedBy: user.id,
      },
    });

    return ok(created, 201, 'Timesheet submitted successfully');
  } catch (error) {
    console.error('[Vendor Timesheets API] POST Error:', error);
    return serverError('vendor timesheet');
  }
});
