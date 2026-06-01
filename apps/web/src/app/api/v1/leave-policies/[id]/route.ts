import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { LeaveService } from '@/lib/services/leave.service';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('leave-policies:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing leave-policies:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const policy = await LeaveService.findPolicyById(params.id, user.tenantId);

    if (!policy) {
      return NextResponse.json(
        { success: false, error: 'Leave policy not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: policy });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});

export const PUT = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, params, permissions } = context;
      if (!permissions.includes('leave-policies:update')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing leave-policies:update permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const body = await request.json();

      const policy = await LeaveService.updatePolicy(params.id, user.tenantId, body);

      return NextResponse.json({ success: true, data: policy });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }),
  {
    action: AuditAction.LEAVE_POLICY_UPDATED,
    resourceType: 'leave_policy',
    captureRequestBody: true,
    extractResourceId: (req, ctx) => ctx?.params?.id,
  }
);

export const DELETE = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, params, permissions } = context;
      if (!permissions.includes('leave-policies:delete')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing leave-policies:delete permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      await LeaveService.deletePolicy(params.id, user.tenantId);

      return NextResponse.json({
        success: true,
        message: 'Leave policy deleted successfully',
      });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }),
  {
    action: AuditAction.LEAVE_POLICY_UPDATED,
    resourceType: 'leave_policy',
    extractResourceId: (req, ctx) => ctx?.params?.id,
  }
);
