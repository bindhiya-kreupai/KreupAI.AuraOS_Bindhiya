import { NextRequest, NextResponse } from 'next/server';
import { ExitService } from '@/lib/services/exit.service';
import { withEnhancedAuth } from '@/lib/auth/enhanced-auth';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const { id } = params;

    const exitRequest = await ExitService.approve(id, user.tenantId);
    return NextResponse.json({ success: true, data: exitRequest });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E3001', message: error.message } },
      { status: 400 }
    );
  }
});
