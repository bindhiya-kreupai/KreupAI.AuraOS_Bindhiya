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
      if (!permissions.includes('leave-balances:create')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing leave-balances:create permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const body = await request.json();

      const { adjustment, reason } = body;
      if (adjustment === undefined || !reason) {
        return NextResponse.json(
          { success: false, error: 'Adjustment amount and reason are required' },
          { status: 400 }
        );
      }

      const balance = await LeaveService.adjustBalance(
        params.id,
        user.tenantId,
        parseFloat(adjustment),
        reason
      );

      return NextResponse.json({
        success: true,
        data: balance,
        message: 'Leave balance adjusted successfully',
      });
    } catch (error: any) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
  }),
  {
    action: AuditAction.LEAVE_POLICY_UPDATED,
    resourceType: 'leave_balance',
    captureRequestBody: true,
    extractResourceId: (req, ctx) => ctx?.params?.id,
  }
);
