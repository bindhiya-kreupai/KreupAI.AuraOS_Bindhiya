import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { cobraService, InvalidCobraTransitionError } from '@/lib/services/cobra.service';

export const dynamic = 'force-dynamic';

export const POST = withAudit(
  withEnhancedAuth(
    async (
      request: NextRequest,
      context: {
        user: { id: string; tenantId: string };
        permissions: string[];
        params: { id: string };
      }
    ) => {
      try {
        if (!context.permissions.includes('benefits/cobra:create')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing benefits/cobra:create' } },
            { status: 403 }
          );
        }
        const body = await request.json().catch(() => ({}));
        const updated = await cobraService.decline(
          context.params.id,
          context.user.tenantId,
          context.user.id,
          body.reason
        );
        if (!updated) {
          return NextResponse.json(
            { success: false, error: { code: 'E4040', message: 'Enrollment not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updated, message: 'Declined' });
      } catch (error) {
        if (error instanceof InvalidCobraTransitionError) {
          return NextResponse.json(
            { success: false, error: { code: 'E4090', message: error.message } },
            { status: 409 }
          );
        }
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E5001',
              message: 'Decline failed',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  {
    action: AuditAction.EMPLOYEE_UPDATED,
    resourceType: 'cobra_enrollment',
    captureRequestBody: true,
  }
);
