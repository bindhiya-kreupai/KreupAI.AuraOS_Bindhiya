import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/middleware/enhanced-auth';
import { LeaveService } from '@/lib/services/leave.service';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const body = await request.json();

    const { reason } = body;
    if (!reason) {
      return NextResponse.json(
        { success: false, error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    const leaveRequest = await LeaveService.rejectRequest(
      params.id,
      user.tenantId,
      user.id,
      reason
    );

    return NextResponse.json({
      success: true,
      data: leaveRequest,
      message: 'Leave request rejected',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
});
