import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { forbidden, notFound, ok, serverError, toDate } from '../../_lib/vendor-subdomain';

export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const vendorTimesheet = (prisma as any).vendorTimesheet;

/** PATCH /api/v1/recruitment/vendors/timesheets/[id] — approve / reject a timesheet. */
export const PATCH = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('recruitment:update')) return forbidden('update');

    const id = params?.id;
    const existing = await vendorTimesheet.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) return notFound('Timesheet not found', 'سجل الدوام غير موجود');

    const body = await request.json();
    const data: Record<string, unknown> = { updatedBy: user.id };
    if (body.status !== undefined) {
      data.status = body.status;
      if (body.status === 'approved' || body.status === 'rejected') {
        data.approvedBy = user.id;
        data.approvedAt = new Date();
      }
    }
    if (body.hours !== undefined) data.hours = Number(body.hours);
    if (body.workerName !== undefined) data.workerName = body.workerName;
    if (body.periodStart !== undefined) data.periodStart = toDate(body.periodStart);
    if (body.periodEnd !== undefined) data.periodEnd = toDate(body.periodEnd);
    if (body.notes !== undefined) data.notes = body.notes;

    const updated = await vendorTimesheet.update({ where: { id }, data });
    return ok(updated, 200, 'Timesheet updated successfully');
  } catch (error) {
    console.error('[Vendor Timesheets API] PATCH Error:', error);
    return serverError('vendor timesheet');
  }
});
