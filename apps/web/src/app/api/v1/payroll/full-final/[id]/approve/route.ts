import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { fullFinalService, InvalidTransitionError } from '@/lib/services/full-final.service';

export const dynamic = 'force-dynamic';

export const POST = withAudit(
  withEnhancedAuth(
    async (
      _request: NextRequest,
      context: {
        user: { id: string; tenantId: string };
        permissions: string[];
        params?: { id?: string };
      }
    ) => {
      try {
        if (!context.permissions.includes('payroll:approve')) {
          return NextResponse.json(
            { success: false, error: { code: 'E4030', message: 'missing payroll:approve' } },
            { status: 403 }
          );
        }
        const id = context.params?.id;
        if (!id) {
          return NextResponse.json(
            { success: false, error: { code: 'E4040', message: 'F&F record not found' } },
            { status: 404 }
          );
        }
        const updated = await fullFinalService.approve(id, context.user.tenantId, context.user.id);
        if (!updated) {
          return NextResponse.json(
            { success: false, error: { code: 'E4040', message: 'F&F record not found' } },
            { status: 404 }
          );
        }
        return NextResponse.json({ success: true, data: updated, message: 'Approved' });
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
              message: 'Approve failed',
              details: { error: error instanceof Error ? error.message : 'Unknown error' },
            },
          },
          { status: 500 }
        );
      }
    }
  ),
  { action: AuditAction.PAYROLL_RUN_APPROVED, resourceType: 'full_final_settlement' }
);
