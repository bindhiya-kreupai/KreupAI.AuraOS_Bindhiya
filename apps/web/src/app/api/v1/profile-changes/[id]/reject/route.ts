import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import {
  profileChangeService,
  InvalidTransitionError,
} from '@/lib/services/profile-change.service';

export const dynamic = 'force-dynamic';

export const POST = withAudit(
  withEnhancedAuth(
    async (
      request: NextRequest,
      context: {
        user: { id: string; tenantId: string };
        permissions: string[];
        params?: { id?: string };
      }
    ) => {
      try {
        if (!context.permissions.includes('employee:approve')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing employee:approve' } },
            { status: 403 }
          );
        }
        const id = context.params?.id;
        if (!id) {
          return NextResponse.json(
            { success: false, error: { code: 'E4040', message: 'Request not found' } },
            { status: 404 }
          );
        }
        const body = await request.json().catch(() => ({}));
        const updated = await profileChangeService.reject(
          id,
          context.user.tenantId,
          context.user.id,
          body.notes
        );
        if (!updated) {
          return NextResponse.json(
            { success: false, error: { code: 'E4040', message: 'Request not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updated, message: 'Rejected' });
      } catch (error) {
        if (error instanceof InvalidTransitionError) {
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
              message: 'Reject failed',
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
    resourceType: 'profile_change_request',
    captureRequestBody: true,
  }
);
