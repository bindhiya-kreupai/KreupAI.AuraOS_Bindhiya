import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { forbidden, notFound, ok, serverError, toDate } from '../../_lib/vendor-subdomain';

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const vendorComplianceDoc = (prisma as any).vendorComplianceDoc;

/** PATCH /api/v1/recruitment/vendors/compliance-docs/[id] — update / review a document. */
export const PATCH = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('recruitment:update')) return forbidden('update');

    const id = params?.id;
    const existing = await vendorComplianceDoc.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) return notFound('Compliance document not found', 'المستند غير موجود');

    const body = await request.json();
    const data: Record<string, unknown> = { updatedBy: user.id };
    if (body.status !== undefined) {
      data.status = body.status;
      if (['valid', 'rejected'].includes(body.status)) {
        data.reviewedBy = user.id;
        data.reviewedAt = new Date();
      }
    }
    if (body.title !== undefined) data.title = body.title;
    if (body.documentNumber !== undefined) data.documentNumber = body.documentNumber;
    if (body.documentType !== undefined) data.documentType = body.documentType;
    if (body.issueDate !== undefined) data.issueDate = toDate(body.issueDate);
    if (body.expiryDate !== undefined) data.expiryDate = toDate(body.expiryDate);
    if (body.documentUrl !== undefined) data.documentUrl = body.documentUrl;
    if (body.notes !== undefined) data.notes = body.notes;

    const updated = await vendorComplianceDoc.update({ where: { id }, data });
    return ok(updated, 200, 'Compliance document updated successfully');
  } catch (error) {
    console.error('[Vendor Compliance Docs API] PATCH Error:', error);
    return serverError('vendor compliance document');
  }
});

/** DELETE /api/v1/recruitment/vendors/compliance-docs/[id] — soft delete. */
export const DELETE = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('recruitment:update')) return forbidden('update');

    const id = params?.id;
    const existing = await vendorComplianceDoc.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) return notFound('Compliance document not found', 'المستند غير موجود');

    await vendorComplianceDoc.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: user.id },
    });
    return ok({ id }, 200, 'Compliance document deleted successfully');
  } catch (error) {
    console.error('[Vendor Compliance Docs API] DELETE Error:', error);
    return serverError('vendor compliance document');
  }
});
