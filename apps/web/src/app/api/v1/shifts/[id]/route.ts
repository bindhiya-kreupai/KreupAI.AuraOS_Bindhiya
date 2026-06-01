import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ShiftManagementService } from '@/lib/services/shift-management.service';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('shifts:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing shifts:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = params;

    const shift = await ShiftManagementService.findShiftById(id, user.tenantId);
    if (!shift) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Shift not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: shift });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5000', message: error.message } },
      { status: 500 }
    );
  }
});

export const PUT = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, params, permissions } = context;
      if (!permissions.includes('shifts:update')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing shifts:update permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const { id } = params;
      const body = await request.json();

      const shift = await ShiftManagementService.updateShift(id, user.tenantId, body);
      if (!shift) {
        return NextResponse.json(
          { success: false, error: { code: 'E2001', message: 'Shift not found' } },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: shift });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: { code: 'E5000', message: error.message } },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.EMPLOYEE_UPDATED,
    resourceType: 'shift',
    captureRequestBody: true,
    extractResourceId: (req, ctx) => ctx?.params?.id,
  }
);

export const DELETE = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, params, permissions } = context;
      if (!permissions.includes('shifts:delete')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing shifts:delete permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const { id } = params;

      const shift = await ShiftManagementService.deleteShift(id, user.tenantId);
      if (!shift) {
        return NextResponse.json(
          { success: false, error: { code: 'E2001', message: 'Shift not found' } },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: shift });
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: { code: 'E5000', message: error.message } },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.EMPLOYEE_UPDATED,
    resourceType: 'shift',
    extractResourceId: (req, ctx) => ctx?.params?.id,
  }
);
