import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ShiftManagementService } from '@/lib/services/shift-management.service';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('shift-swaps:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing shift-swaps:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = params;

    const swap = await ShiftManagementService.findSwapById(id, user.tenantId);
    if (!swap) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'Swap request not found',
            messageAr: 'طلب التبادل غير موجود',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: swap });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'E5000', message: 'Internal server error', messageAr: 'خطأ في الخادم' },
      },
      { status: 500 }
    );
  }
});

export const PUT = withAudit(
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

      const swap = await ShiftManagementService.updateSwap(id, user.tenantId, body);
      if (!swap) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E2001',
              message: 'Swap request not found',
              messageAr: 'طلب التبادل غير موجود',
            },
          },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: swap });
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E5000', message: 'Internal server error', messageAr: 'خطأ في الخادم' },
        },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.EMPLOYEE_UPDATED,
    resourceType: 'shiftSwap',
    captureRequestBody: true,
    extractResourceId: (req, ctx) => ctx?.params?.id,
  }
);
