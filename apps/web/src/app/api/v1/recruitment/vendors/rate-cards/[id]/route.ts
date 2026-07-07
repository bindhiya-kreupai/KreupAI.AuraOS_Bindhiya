import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { forbidden, notFound, ok, serverError, toDate } from '../../_lib/vendor-subdomain';

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const vendorRateCard = (prisma as any).vendorRateCard;

/** PATCH /api/v1/recruitment/vendors/rate-cards/[id] — update a rate card. */
export const PATCH = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('recruitment:update')) return forbidden('update');

    const id = params?.id;
    const existing = await vendorRateCard.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) return notFound('Rate card not found', 'بطاقة الأسعار غير موجودة');

    const body = await request.json();
    const data: Record<string, unknown> = { updatedBy: user.id };
    if (body.roleTitle !== undefined) data.roleTitle = body.roleTitle;
    if (body.experienceLevel !== undefined) data.experienceLevel = body.experienceLevel;
    if (body.location !== undefined) data.location = body.location;
    if (body.ratePeriod !== undefined) data.ratePeriod = body.ratePeriod;
    if (body.rate !== undefined) data.rate = Number(body.rate);
    if (body.currency !== undefined) data.currency = body.currency;
    if (body.effectiveFrom !== undefined) data.effectiveFrom = toDate(body.effectiveFrom);
    if (body.effectiveTo !== undefined) data.effectiveTo = toDate(body.effectiveTo);
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    const updated = await vendorRateCard.update({ where: { id }, data });
    return ok(updated, 200, 'Rate card updated successfully');
  } catch (error) {
    console.error('[Vendor Rate Cards API] PATCH Error:', error);
    return serverError('vendor rate card');
  }
});

/** DELETE /api/v1/recruitment/vendors/rate-cards/[id] — soft delete. */
export const DELETE = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('recruitment:update')) return forbidden('update');

    const id = params?.id;
    const existing = await vendorRateCard.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) return notFound('Rate card not found', 'بطاقة الأسعار غير موجودة');

    await vendorRateCard.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: user.id },
    });
    return ok({ id }, 200, 'Rate card deleted successfully');
  } catch (error) {
    console.error('[Vendor Rate Cards API] DELETE Error:', error);
    return serverError('vendor rate card');
  }
});
