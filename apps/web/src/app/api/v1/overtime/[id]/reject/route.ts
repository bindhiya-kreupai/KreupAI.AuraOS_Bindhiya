import { NextRequest, NextResponse } from 'next/server';
import { OvertimeService } from '@/lib/services/overtime.service';
import { withEnhancedAuth } from '@/lib/auth/enhanced-auth';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const { id } = params;
    const body = await request.json();
    const { reason } = body;

    const overtime = await OvertimeService.reject(id, user.tenantId, user.id, reason);
    return NextResponse.json({ success: true, data: overtime });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'E3001', message: error.message } }, { status: 400 });
  }
});
