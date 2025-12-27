import { NextRequest, NextResponse } from 'next/server';
import { ProbationService } from '@/lib/services/probation.service';
import { withEnhancedAuth } from '@/lib/auth/enhanced-auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const { id } = params;

    const probation = await ProbationService.findById(id, user.tenantId);
    if (!probation) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Probation not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: probation });
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

    const probation = await ProbationService.update(id, user.tenantId, body);
    if (!probation) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Probation not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: probation });
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

    const probation = await ProbationService.delete(id, user.tenantId);
    if (!probation) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Probation not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: probation });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5000', message: error.message } },
      { status: 500 }
    );
  }
});
