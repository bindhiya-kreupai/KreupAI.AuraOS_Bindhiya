import { NextRequest, NextResponse } from 'next/server';
import { TimeTrackingService } from '@/lib/services/time-tracking.service';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const { id } = params;

    const punch = await TimeTrackingService.findPunchById(id, user.tenantId);
    if (!punch) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Punch record not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: punch });
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

    const punch = await TimeTrackingService.updatePunch(id, user.tenantId, body);
    if (!punch) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Punch record not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: punch });
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

    const punch = await TimeTrackingService.deletePunch(id, user.tenantId);
    if (!punch) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Punch record not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: punch });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5000', message: error.message } },
      { status: 500 }
    );
  }
});
