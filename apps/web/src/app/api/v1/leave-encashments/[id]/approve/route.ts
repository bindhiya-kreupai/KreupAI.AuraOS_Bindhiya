import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { LeaveService } from '@/lib/services/leave.service';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, params, permissions } = context;
      if (!permissions.includes('leave-encashments:create')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing leave-encashments:create permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }

      const encashment = await LeaveService.approveEncashment(params.id, user.tenantId, user.id);

      return NextResponse.json({
        success: true,
        data: encashment,
        message: 'Encashment request approved successfully',
      });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }),
  {
    action: AuditAction.LEAVE_REQUEST_APPROVED,
    resourceType: 'leave_encashment',
    extractResourceId: (req, ctx) => ctx?.params?.id,
  }
);
