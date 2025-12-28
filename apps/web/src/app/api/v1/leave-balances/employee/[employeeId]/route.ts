import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { LeaveService } from '@/lib/services/leave.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const { searchParams } = new URL(request.url);

    const leaveYear = searchParams.get('leaveYear')
      ? parseInt(searchParams.get('leaveYear')!)
      : undefined;

    const balances = await LeaveService.getBalanceByEmployee(
      user.tenantId,
      params.employeeId,
      leaveYear
    );

    return NextResponse.json({ success: true, data: balances });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});
