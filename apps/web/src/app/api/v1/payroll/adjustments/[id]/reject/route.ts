export const dynamic = 'force-dynamic';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { AuthorizationError, ValidationError } from '@/lib/errors';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { handleError } from '@/lib/middleware/error-handler';
import { PayrollService } from '@/lib/services/payroll.service';

/**
 * POST /api/v1/payroll/adjustments/[id]/reject
 * Rejects at the current stage. PENDING requires HR_ADMIN; HR_APPROVED
 * requires FINANCE_DIRECTOR. A rejection reason is mandatory.
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
      const body = await request.json().catch(() => ({}));
      const reason = body?.reason;

      if (typeof reason !== 'string' || !reason.trim()) {
        throw new ValidationError('Rejection reason is required');
      }

      const updated = await PayrollService.rejectAdjustment(
        id,
        user.tenantId,
        user.userId,
        roles || [],
        reason
      );

      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Payroll adjustment rejected',
      });
    } catch (error: any) {
      return handleError(error);
    }
  }),
  {
    action: AuditAction.PAYROLL_RUN_REJECTED,
    resourceType: 'PAYROLL_ADJUSTMENT',
    captureResponseBody: true,
    extractResourceId: (req: any, ctx: any) => ctx?.params?.id,
  }
);
