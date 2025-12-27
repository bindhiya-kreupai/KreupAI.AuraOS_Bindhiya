import { NextRequest, NextResponse } from 'next/server';
import { ShiftManagementService } from '@/lib/services/shift-management.service';
import { withEnhancedAuth } from '@/lib/auth/enhanced-auth';

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const { id } = params;
    const body = await request.json();

    const roster = await ShiftManagementService.updateRoster(id, user.tenantId, body);
    if (!roster) {
      return NextResponse.json({ success: false, error: { code: 'E2001', message: 'Roster not found' } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: roster });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'E5000', message: error.message } }, { status: 500 });
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const { id } = params;

    const roster = await ShiftManagementService.deleteRoster(id, user.tenantId);
    if (!roster) {
      return NextResponse.json({ success: false, error: { code: 'E2001', message: 'Roster not found' } }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: roster });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'E5000', message: error.message } }, { status: 500 });
  }
});
