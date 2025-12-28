import { NextRequest, NextResponse } from 'next/server';
import { ShiftManagementService } from '@/lib/services/shift-management.service';
import { withEnhancedAuth } from '@/lib/auth';

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

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
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
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
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
});
