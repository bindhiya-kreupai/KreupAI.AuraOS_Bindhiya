import { NextRequest, NextResponse } from 'next/server';
import { ShiftManagementService } from '@/lib/services/shift-management.service';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
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

export const PUT = withAudit(withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
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
}), {
  action: AuditAction.EMPLOYEE_UPDATED,
  resourceType: 'shift',
  captureRequestBody: true,
  extractResourceId: (req, ctx) => ctx?.params?.id,
});

export const DELETE = withAudit(withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
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
}), {
  action: AuditAction.EMPLOYEE_UPDATED,
  resourceType: 'shift',
  extractResourceId: (req, ctx) => ctx?.params?.id,
});
