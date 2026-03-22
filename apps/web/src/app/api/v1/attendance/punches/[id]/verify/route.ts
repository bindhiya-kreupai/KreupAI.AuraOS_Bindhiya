import { NextRequest, NextResponse } from 'next/server';
import { TimeTrackingService } from '@/lib/services/time-tracking.service';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const POST = withAudit(withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const { id } = params;

    const punch = await TimeTrackingService.verifyPunch(id, user.tenantId, user.id);
    return NextResponse.json({ success: true, data: punch });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E3001', message: error.message } },
      { status: 400 }
    );
  }
}), {
  action: AuditAction.ATTENDANCE_UPDATED,
  resourceType: 'attendance_punch',
  extractResourceId: (req, ctx) => ctx?.params?.id,
});
