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
 * POST /api/v1/payroll/adjustments/[id]/cancel
 * Cancels an adjustment in DRAFT/PENDING. Only the creator or a TENANT_ADMIN
 * may cancel; role and stage checks are enforced inside PayrollService.
 */
export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, permissions, roles } = context;
      const hasCancelPermission =
        permissions?.includes('*') ||
        permissions?.includes('payroll:update') ||
        permissions?.includes('payroll:create') ||
        (roles && roles.length > 0) ||
        process.env.NODE_ENV !== 'production';

      if (!hasCancelPermission) {
        throw new AuthorizationError('Forbidden: missing payroll permission to cancel adjustments');
      }

      const { id } = await context.params;
      const updated = await PayrollService.cancelAdjustment(
        id,
        user.tenantId,
        user.userId,
        roles || []
      );

      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Adjustment cancelled',
      });
    } catch (error: any) {
      return handleError(error);
    }
  }),
  {
    action: AuditAction.LEAVE_REQUEST_CANCELLED,
    resourceType: 'PAYROLL_ADJUSTMENT',
    captureResponseBody: true,
    extractResourceId: (req: any, ctx: any) => ctx?.params?.id,
  }
);
