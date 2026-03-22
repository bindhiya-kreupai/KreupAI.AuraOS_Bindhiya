import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { LeaveService } from '@/lib/services/leave.service';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

export const POST = withAudit(withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const body = await request.json();

    const { reason } = body;
    if (!reason) {
      return NextResponse.json(
        { success: false, error: 'Cancellation reason is required' },
        { status: 400 }
      );
    }

    const leaveRequest = await LeaveService.cancelRequest(
      params.id,
      user.tenantId,
      user.id,
      reason
    );

    return NextResponse.json({
      success: true,
      data: leaveRequest,
      message: 'Leave request cancelled successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}), {
  action: AuditAction.LEAVE_REQUEST_CANCELLED,
  resourceType: 'leave_request',
  captureRequestBody: true,
  extractResourceId: (req, ctx) => ctx?.params?.id,
});
