import { NextRequest, NextResponse } from 'next/server';
import { OvertimeService } from '@/lib/services/overtime.service';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const POST = withAudit(withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const { id } = params;
    const body = await request.json();
    const { reason } = body;

    const regularization = await OvertimeService.rejectRegularization(id, user.tenantId, user.id, reason);
    return NextResponse.json({ success: true, data: regularization });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'E3001', message: error.message } }, { status: 400 });
  }
}), {
  action: AuditAction.ATTENDANCE_UPDATED,
  resourceType: 'attendance_regularization',
  captureRequestBody: true,
  extractResourceId: (req, ctx) => ctx?.params?.id,
});
