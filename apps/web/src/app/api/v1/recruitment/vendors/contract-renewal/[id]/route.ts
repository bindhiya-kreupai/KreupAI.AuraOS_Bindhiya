import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { forbidden, notFound, ok, serverError, toDate } from '../../_lib/vendor-subdomain';

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const vendorContractRenewal = (prisma as any).vendorContractRenewal;

/** PATCH /api/v1/recruitment/vendors/contract-renewal/[id] — record a renewal decision. */
export const PATCH = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('recruitment:update')) return forbidden('update');

    const id = params?.id;
    const existing = await vendorContractRenewal.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) return notFound('Renewal not found', 'التجديد غير موجود');

    const body = await request.json();
    const data: Record<string, unknown> = { updatedBy: user.id };
    if (body.status !== undefined) {
      data.status = body.status;
      if (['approved', 'rejected', 'renewed'].includes(body.status)) {
        data.reviewedBy = user.id;
        data.reviewedAt = new Date();
      }
    }
    if (body.decision !== undefined) data.decision = body.decision;
    if (body.decisionNotes !== undefined) data.decisionNotes = body.decisionNotes;
    if (body.currentEndDate !== undefined) data.currentEndDate = toDate(body.currentEndDate);
    if (body.proposedEndDate !== undefined) data.proposedEndDate = toDate(body.proposedEndDate);

    const updated = await vendorContractRenewal.update({ where: { id }, data });

    // When a renewal is completed, propagate the new end date to the vendor record.
    if (body.status === 'renewed' && updated.proposedEndDate) {
      await prisma.recruitmentVendor.updateMany({
        where: { id: updated.vendorId, tenantId: user.tenantId },
        data: { contractEndDate: updated.proposedEndDate, updatedBy: user.id },
      });
    }

    return ok(updated, 200, 'Renewal updated successfully');
  } catch (error) {
    console.error('[Vendor Contract Renewal API] PATCH Error:', error);
    return serverError('vendor contract renewal');
  }
});
