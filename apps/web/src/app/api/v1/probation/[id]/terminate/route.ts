import { NextRequest, NextResponse } from 'next/server';
import { ProbationService } from '@/lib/services/probation.service';
import { withEnhancedAuth } from '@/lib/auth';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const { id } = params;
    const body = await request.json();
    const { reason } = body;

    const probation = await ProbationService.terminate(id, user.tenantId, reason);
    return NextResponse.json({ success: true, data: probation });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E3001', message: error.message } },
      { status: 400 }
    );
  }
});
