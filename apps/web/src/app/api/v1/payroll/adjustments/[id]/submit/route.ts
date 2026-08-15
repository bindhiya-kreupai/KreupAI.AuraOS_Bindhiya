export const dynamic = 'force-dynamic';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { AuthorizationError } from '@/lib/errors';
import { handleError } from '@/lib/middleware/error-handler';
import { PayrollService } from '@/lib/services/payroll.service';

/**
 * POST /api/v1/payroll/adjustments/[id]/submit
 * Submits a DRAFT adjustment into the approval queue (DRAFT -> PENDING).
 * Only the creator may submit; employees must hold payroll:create,
 * other roles use payroll:update.
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, roles } = context;
    if (!permissions.includes('payroll:update') && !permissions.includes('payroll:create')) {
      throw new AuthorizationError('Forbidden: missing payroll permission to submit adjustments');
    }

    const { id } = await context.params;

    const existing = await PayrollService.findAdjustmentById(id, user.tenantId);
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E3001', message: 'Adjustment not found', messageAr: 'التعديل غير موجود' },
        },
        { status: 404 }
      );
    }
    const allowed = PayrollService.getAdjustmentActions(existing, {
      userId: user.userId,
      roles: roles || [],
    });
    if (!allowed.includes('submit')) {
      throw new AuthorizationError('Only the creator can submit their own draft adjustment');
    }

    const updated = await PayrollService.submitAdjustment(id, user.tenantId, user.userId);

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Adjustment submitted for approval',
    });
  } catch (error: any) {
    return handleError(error);
  }
});
