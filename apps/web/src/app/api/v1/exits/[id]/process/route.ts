import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { exitService, InvalidExitTransitionError } from '@/lib/services/exit.service';

/**
 * POST /api/v1/exits/[id]/process
 * APPROVED → PROCESSING. Flips clearanceStatus to IN_PROGRESS so the
 * clearance dashboard surfaces the request.
 */
export const POST = withAudit(
  withEnhancedAuth(async (_request: NextRequest, context: any) => {
    try {
      const { user, params, permissions } = context;
      if (!permissions.includes('exits:create')) {
        return NextResponse.json(
          { success: false, error: { code: 'E4030', message: 'missing exits:create' } },
          { status: 403 }
        );
      }
      const updated = await exitService.startProcessing(params.id, user.tenantId);
      if (!updated) {
        return NextResponse.json(
          { success: false, error: { code: 'E4040', message: 'Exit request not found' } },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: updated, message: 'Processing started' });
    } catch (error: any) {
      if (error instanceof InvalidExitTransitionError) {
        return NextResponse.json(
          { success: false, error: { code: 'E4090', message: error.message } },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, error: { code: 'E3001', message: error.message } },
        { status: 400 }
      );
    }
  }),
  { action: AuditAction.EMPLOYEE_UPDATED, resourceType: 'exit_request' }
);
