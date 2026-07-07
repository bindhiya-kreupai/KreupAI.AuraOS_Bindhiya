import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { forbidden, notFound, ok, serverError, toDate } from '../../_lib/vendor-subdomain';

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const vendorInvoice = (prisma as any).vendorInvoice;

/** PATCH /api/v1/recruitment/vendors/invoices/[id] — approve / reject / mark paid. */
export const PATCH = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('recruitment:update')) return forbidden('update');

    const id = params?.id;
    const existing = await vendorInvoice.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) return notFound('Invoice not found', 'الفاتورة غير موجودة');

    const body = await request.json();
    const data: Record<string, unknown> = { updatedBy: user.id };
    if (body.status !== undefined) {
      data.status = body.status;
      if (body.status === 'approved' || body.status === 'rejected') {
        data.approvedBy = user.id;
        data.approvedAt = new Date();
      }
      if (body.status === 'paid') {
        data.paidAt = new Date();
      }
    }
    if (body.amount !== undefined) data.amount = Number(body.amount);
    if (body.currency !== undefined) data.currency = body.currency;
    if (body.dueDate !== undefined) data.dueDate = toDate(body.dueDate);
    if (body.invoiceDate !== undefined) data.invoiceDate = toDate(body.invoiceDate);
    if (body.description !== undefined) data.description = body.description;

    const updated = await vendorInvoice.update({ where: { id }, data });
    return ok(updated, 200, 'Invoice updated successfully');
  } catch (error) {
    console.error('[Vendor Invoices API] PATCH Error:', error);
    return serverError('vendor invoice');
  }
});
