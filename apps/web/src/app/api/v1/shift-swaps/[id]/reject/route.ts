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
      if (!permissions.includes('shift-swaps:update')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing shift-swaps:update permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const { id } = params;
      const body = await request.json();
      const { reason } = body;
      const employeeId = context.employeeId || user.userId;

      const swap = await ShiftManagementService.rejectSwap(id, user.tenantId, employeeId, reason);
      return NextResponse.json({ success: true, data: swap });
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E3001',
            message: 'Failed to reject swap request',
            messageAr: 'خطأ في رفض طلب التبادل',
          },
        },
        { status: 400 }
      );
    }
  }),
  {
    action: AuditAction.LEAVE_REQUEST_REJECTED,
    resourceType: 'shiftSwap',
    captureRequestBody: true,
    extractResourceId: (req, ctx) => ctx?.params?.id,
  }
);
