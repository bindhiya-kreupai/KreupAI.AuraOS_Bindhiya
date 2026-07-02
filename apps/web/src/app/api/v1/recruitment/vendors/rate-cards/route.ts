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
const vendorRateCard = (prisma as any).vendorRateCard;

/** GET /api/v1/recruitment/vendors/rate-cards — tenant-scoped list with vendor names. */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('recruitment:read')) return forbidden('read');

    const { page, pageSize, skip, searchParams } = parsePaging(request);
    const vendorId = searchParams.get('vendorId') || undefined;

    const where: Record<string, unknown> = { tenantId: user.tenantId, isDeleted: false };
    if (vendorId) where.vendorId = vendorId;

    const [rows, total] = await Promise.all([
      vendorRateCard.findMany({ where, skip, take: pageSize, orderBy: { roleTitle: 'asc' } }),
      vendorRateCard.count({ where }),
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
    console.error('[Vendor Rate Cards API] GET Error:', error);
    return serverError('vendor rate cards');
  }
});

/** POST /api/v1/recruitment/vendors/rate-cards — add a rate card entry. */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('recruitment:create')) return forbidden('create');

    const body = await request.json();
    if (!body?.vendorId || !body?.roleTitle) {
      return badRequest(
        'vendorId and roleTitle are required',
        'معرّف المورّد والمسمى الوظيفي مطلوبان'
      );
    }
    if (!(await assertVendor(user.tenantId, body.vendorId))) {
      return notFound('Vendor not found', 'المورّد غير موجود');
    }

    const created = await vendorRateCard.create({
      data: {
        tenantId: user.tenantId,
        vendorId: body.vendorId,
        roleTitle: String(body.roleTitle),
        experienceLevel: body.experienceLevel ?? 'mid',
        location: body.location ?? null,
        ratePeriod: body.ratePeriod ?? 'hourly',
        rate: Number(body.rate ?? 0),
        currency: body.currency ?? 'USD',
        effectiveFrom: toDate(body.effectiveFrom),
        effectiveTo: toDate(body.effectiveTo),
        isActive: body.isActive ?? true,
        createdBy: user.id,
        updatedBy: user.id,
      },
    });

    return ok(created, 201, 'Rate card created successfully');
  } catch (error) {
    console.error('[Vendor Rate Cards API] POST Error:', error);
    return serverError('vendor rate card');
  }
});
