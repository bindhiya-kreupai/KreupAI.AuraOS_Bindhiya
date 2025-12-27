import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/middleware/enhanced-auth';
import { LeaveService } from '@/lib/services/leave.service';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
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
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
});
