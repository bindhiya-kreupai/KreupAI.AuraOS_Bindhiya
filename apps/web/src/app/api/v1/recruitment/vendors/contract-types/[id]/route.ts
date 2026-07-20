import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { forbidden, notFound, ok, serverError } from '../../_lib/vendor-subdomain';

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const vendorContractType = (prisma as any).vendorContractType;

/** PATCH /api/v1/recruitment/vendors/contract-types/[id] — update a contract type. */
export const PATCH = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('recruitment:update')) return forbidden('update');

    const id = params?.id;
    const existing = await vendorContractType.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) return notFound('Contract type not found', 'نوع العقد غير موجود');

    const body = await request.json();
    const data: Record<string, unknown> = { updatedBy: user.id };
    if (body.name !== undefined) data.name = body.name;
    if (body.engagementModel !== undefined) data.engagementModel = body.engagementModel;
    if (body.noticePeriodDays !== undefined) data.noticePeriodDays = Number(body.noticePeriodDays);
    if (body.paymentTermsDays !== undefined) data.paymentTermsDays = Number(body.paymentTermsDays);
    if (body.description !== undefined) data.description = body.description;
    if (body.isActive !== undefined) data.isActive = Boolean(body.isActive);

    const updated = await vendorContractType.update({ where: { id }, data });
    return ok(updated, 200, 'Contract type updated successfully');
  } catch (error) {
    console.error('[Vendor Contract Types API] PATCH Error:', error);
    return serverError('vendor contract type');
  }
});

/** DELETE /api/v1/recruitment/vendors/contract-types/[id] — soft delete. */
export const DELETE = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('recruitment:update')) return forbidden('update');

    const id = params?.id;
    const existing = await vendorContractType.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) return notFound('Contract type not found', 'نوع العقد غير موجود');

    await vendorContractType.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: user.id },
    });
    return ok({ id }, 200, 'Contract type deleted successfully');
  } catch (error) {
    console.error('[Vendor Contract Types API] DELETE Error:', error);
    return serverError('vendor contract type');
  }
});
