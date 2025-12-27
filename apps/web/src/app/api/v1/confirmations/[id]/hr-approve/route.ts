import { NextRequest, NextResponse } from 'next/server';
import { ConfirmationService } from '@/lib/services/confirmation.service';
import { withEnhancedAuth } from '@/lib/auth/enhanced-auth';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const { id } = params;

    const confirmation = await ConfirmationService.hrApprove(id, user.tenantId);
    return NextResponse.json({ success: true, data: confirmation });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E3001', message: error.message } },
      { status: 400 }
    );
  }
});
