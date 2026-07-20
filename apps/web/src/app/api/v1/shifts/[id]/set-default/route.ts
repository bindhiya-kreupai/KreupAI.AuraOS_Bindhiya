import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ShiftManagementService } from '@/lib/services/shift-management.service';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, params, permissions } = context;
      if (!permissions.includes('shifts:create')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing shifts:create permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const { id } = params;

      const shift = await ShiftManagementService.setDefaultShift(id, user.tenantId);
      return NextResponse.json({ success: true, data: shift });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: { code: 'E3001', message: 'Failed to set default shift' } },
        { status: 400 }
      );
    }
  }),
  {
    // TODO: Add shift-specific AuditAction (SHIFT_DEFAULT_UPDATED)
    action: AuditAction.EMPLOYEE_UPDATED,
    resourceType: 'shift',
    extractResourceId: (req, ctx) => ctx?.params?.id,
  }
);
