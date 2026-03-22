import { NextRequest, NextResponse } from 'next/server';
import { TimeTrackingService } from '@/lib/services/time-tracking.service';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const { id } = params;

    const record = await TimeTrackingService.findRecordById(id, user.tenantId);
    if (!record) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Attendance record not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: record });
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

    const record = await TimeTrackingService.updateRecord(id, user.tenantId, body);
    if (!record) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Attendance record not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5000', message: error.message } },
      { status: 500 }
    );
  }
}), {
  action: AuditAction.ATTENDANCE_UPDATED,
  resourceType: 'attendance_record',
  captureRequestBody: true,
  extractResourceId: (req, ctx) => ctx?.params?.id,
});

export const DELETE = withAudit(withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const { id } = params;

    const record = await TimeTrackingService.deleteRecord(id, user.tenantId);
    if (!record) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Attendance record not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: record });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5000', message: error.message } },
      { status: 500 }
    );
  }
}), {
  action: AuditAction.ATTENDANCE_UPDATED,
  resourceType: 'attendance_record',
  extractResourceId: (req, ctx) => ctx?.params?.id,
});
