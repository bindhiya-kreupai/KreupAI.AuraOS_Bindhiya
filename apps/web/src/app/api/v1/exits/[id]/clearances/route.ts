import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { exitService } from '@/lib/services/exit.service';

/**
 * POST /api/v1/exits/[id]/clearances
 * Body: { department, description }
 * Adds a per-department clearance line for the exit request.
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
      const body = await request.json();
      if (!body?.department || !body?.description) {
        return NextResponse.json(
          { success: false, error: { code: 'E2001', message: 'department, description required' } },
          { status: 400 }
        );
      }
      const created = await exitService.addClearance(params.id, user.tenantId, {
        department: body.department,
        description: body.description,
      });
      if (!created) {
        return NextResponse.json(
          { success: false, error: { code: 'E4040', message: 'Exit request not found' } },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, data: created, message: 'Clearance added' },
        { status: 201 }
      );
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: { code: 'E3001', message: error.message } },
        { status: 400 }
      );
    }
  }),
  { action: AuditAction.EMPLOYEE_UPDATED, resourceType: 'exit_clearance', captureRequestBody: true }
);
