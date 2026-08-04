/**
 * POST /api/v1/payroll/adjustments/[id]/reject
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { PayrollService } from '@/lib/services/payroll.service';

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: any) => {
  try {
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/');
    const id = pathSegments[pathSegments.indexOf('adjustments') + 1];

    const body = await req.json().catch(() => ({}));
    const tenantId = body.tenantId || ctx.user?.tenantId || 'dev-tenant';
    const rejectedBy = body.rejectedBy || ctx.user?.id || 'dev-user';
    const reason = body.reason || 'Rejected by approver';

    const result = await PayrollService.rejectAdjustment(id, tenantId, rejectedBy, reason);

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Payroll adjustment rejected',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to reject payroll adjustment' },
      { status: 400 }
    );
  }
});
