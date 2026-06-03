import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { exitService, InvalidExitTransitionError } from '@/lib/services/exit.service';

export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, params, permissions } = context;
      if (!permissions.includes('exits:create')) {
        return NextResponse.json(
          { success: false, error: { code: 'E4030', message: 'missing exits:create' } },
          { status: 403 }
        );
      }
      const body = await request.json().catch(() => ({}));
      const updated = await exitService.cancel(params.id, user.tenantId, body.reason);
      if (!updated) {
        return NextResponse.json(
          { success: false, error: { code: 'E4040', message: 'Exit request not found' } },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: updated, message: 'Canceled' });
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
  { action: AuditAction.EMPLOYEE_UPDATED, resourceType: 'exit_request', captureRequestBody: true }
);
