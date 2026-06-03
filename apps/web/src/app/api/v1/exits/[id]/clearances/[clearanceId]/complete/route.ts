import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { exitService } from '@/lib/services/exit.service';

/**
 * POST /api/v1/exits/[id]/clearances/[clearanceId]/complete
 * Body: { notes? }
 * Marks a single clearance APPROVED. Rolls up clearanceStatus on the parent
 * exit request to COMPLETED when all clearances pass, or IN_PROGRESS when
 * at least one but not all are complete.
 */
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
      const updated = await exitService.completeClearance(
        params.id,
        params.clearanceId,
        user.tenantId,
        user.id,
        body.notes
      );
      if (!updated) {
        return NextResponse.json(
          { success: false, error: { code: 'E4040', message: 'Clearance not found' } },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: updated, message: 'Clearance approved' });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: { code: 'E3001', message: error.message } },
        { status: 400 }
      );
    }
  }),
  { action: AuditAction.EMPLOYEE_UPDATED, resourceType: 'exit_clearance', captureRequestBody: true }
);
