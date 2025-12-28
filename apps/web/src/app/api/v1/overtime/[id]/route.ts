import { NextRequest, NextResponse } from 'next/server';
import { OvertimeService } from '@/lib/services/overtime.service';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const { id } = params;

    const overtime = await OvertimeService.findById(id, user.tenantId);
    if (!overtime) {
      return NextResponse.json({ success: false, error: { code: 'E2001', message: 'Overtime not found' } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: overtime });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'E5000', message: error.message } }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const { id } = params;
    const body = await request.json();

    const overtime = await OvertimeService.update(id, user.tenantId, body);
    if (!overtime) {
      return NextResponse.json({ success: false, error: { code: 'E2001', message: 'Overtime not found' } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: overtime });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'E5000', message: error.message } }, { status: 500 });
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const { id } = params;

    const overtime = await OvertimeService.delete(id, user.tenantId);
    if (!overtime) {
      return NextResponse.json({ success: false, error: { code: 'E2001', message: 'Overtime not found' } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: overtime });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'E5000', message: error.message } }, { status: 500 });
  }
});
