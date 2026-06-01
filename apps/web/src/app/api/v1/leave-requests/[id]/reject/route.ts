import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { LeaveService } from '@/lib/services/leave.service';
import { auditMiddleware } from '@/lib/middleware/audit.middleware';

export const POST = auditMiddleware.rejectLeaveRequest(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, params, permissions } = context;
      if (!permissions.includes('leave-requests:create')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing leave-requests:create permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const body = await request.json();

      const { reason } = body;
      if (!reason) {
        return NextResponse.json(
          { success: false, error: 'Rejection reason is required' },
          { status: 400 }
        );
      }

      const leaveRequest = await LeaveService.rejectRequest(
        params.id,
        user.tenantId,
        user.id,
        reason
      );

      return NextResponse.json({
        success: true,
        data: leaveRequest,
        message: 'Leave request rejected',
      });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  })
);
