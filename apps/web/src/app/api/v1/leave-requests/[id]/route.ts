import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { LeaveService } from '@/lib/services/leave.service';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('leave-requests:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing leave-requests:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const leaveRequest = await LeaveService.findRequestById(params.id, user.tenantId);

    if (!leaveRequest) {
      return NextResponse.json(
        { success: false, error: 'Leave request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: leaveRequest });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const PUT = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, params, permissions } = context;
      if (!permissions.includes('leave-requests:update')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing leave-requests:update permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const body = await request.json();

      const leaveRequest = await LeaveService.updateRequest(params.id, user.tenantId, body);

      return NextResponse.json({ success: true, data: leaveRequest });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }),
  {
    action: AuditAction.LEAVE_REQUEST_CREATED,
    resourceType: 'leave_request',
    captureRequestBody: true,
    extractResourceId: (req, ctx) => ctx?.params?.id,
  }
);

export const DELETE = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, params, permissions } = context;
      if (!permissions.includes('leave-requests:delete')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing leave-requests:delete permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      await LeaveService.deleteRequest(params.id, user.tenantId);

      return NextResponse.json({
        success: true,
        message: 'Leave request deleted successfully',
      });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }),
  {
    action: AuditAction.LEAVE_REQUEST_CANCELLED,
    resourceType: 'leave_request',
    extractResourceId: (req, ctx) => ctx?.params?.id,
  }
);
