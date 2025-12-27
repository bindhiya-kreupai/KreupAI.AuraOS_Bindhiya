import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { LifeEventService } from '@/lib/services/life-event.service';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = context.params;
    const { user } = context;
    const body = await request.json();
    const lifeEvent = await LifeEventService.reject(id, user.tenantId, user.userId, body.reason);
    return NextResponse.json({ success: true, data: lifeEvent });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'E5001', message: error instanceof Error ? error.message : 'Failed to reject' } }, { status: 500 });
  }
});
