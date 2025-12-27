import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { IDCardService } from '@/lib/services/id-card.service';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = context.params;
    const { user } = context;
    const body = await request.json();
    const card = await IDCardService.revoke(id, user.tenantId, user.userId, body.reason);
    return NextResponse.json({ success: true, data: card });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { code: 'E5001', message: error.message } }, { status: 500 });
  }
});
