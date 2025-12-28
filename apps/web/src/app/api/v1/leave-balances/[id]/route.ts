import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { LeaveService } from '@/lib/services/leave.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const balance = await LeaveService.findBalanceById(params.id, user.tenantId);

    if (!balance) {
      return NextResponse.json(
        { success: false, error: 'Leave balance not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: balance });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const body = await request.json();

    const balance = await LeaveService.updateBalance(
      params.id,
      user.tenantId,
      body
    );

    return NextResponse.json({ success: true, data: balance });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
});
