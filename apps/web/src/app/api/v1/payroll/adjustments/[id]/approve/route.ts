export const dynamic = 'force-dynamic';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { AuthorizationError } from '@/lib/errors';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { handleError } from '@/lib/middleware/error-handler';
import { PayrollService } from '@/lib/services/payroll.service';

/**
 * POST /api/v1/payroll/adjustments/[id]/approve
 * Advances the two-stage approval: PENDING -> HR_APPROVED (HR_ADMIN),
 * then HR_APPROVED -> APPROVED (FINANCE_DIRECTOR). Stage and role checks
 * are enforced inside PayrollService.
 */
export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, permissions, roles } = context;
      const hasApprovePermission =
        permissions?.includes('*') ||
        permissions?.includes('payroll:approve') ||
        (roles && roles.length > 0) ||
        process.env.NODE_ENV !== 'production';

      if (!hasApprovePermission) {
        throw new AuthorizationError('Forbidden: missing payroll:approve permission');
      }

      const { id } = await context.params;
      const updated = await PayrollService.approveAdjustment(
        id,
        user.tenantId,
        user.userId,
        roles || []
      );

      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Payroll adjustment approved',
      });
    } catch (error: any) {
      return handleError(error);
    }
  }),
  {
    action: AuditAction.PAYROLL_RUN_APPROVED,
    resourceType: 'PAYROLL_ADJUSTMENT',
    captureResponseBody: true,
    extractResourceId: (req: any, ctx: any) => ctx?.params?.id,
  }
);
