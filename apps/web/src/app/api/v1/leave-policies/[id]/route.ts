import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { LeaveService } from '@/lib/services/leave.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const policy = await LeaveService.findPolicyById(params.id, user.tenantId);

    if (!policy) {
      return NextResponse.json(
        { success: false, error: 'Leave policy not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: policy });
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

    const policy = await LeaveService.updatePolicy(
      params.id,
      user.tenantId,
      body
    );

    return NextResponse.json({ success: true, data: policy });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    await LeaveService.deletePolicy(params.id, user.tenantId);

    return NextResponse.json({
      success: true,
      message: 'Leave policy deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
});
