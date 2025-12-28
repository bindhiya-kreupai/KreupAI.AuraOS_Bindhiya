import { NextRequest, NextResponse } from 'next/server';
import { ExitService } from '@/lib/services/exit.service';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const { id } = params;

    const exitRequest = await ExitService.findById(id, user.tenantId);
    if (!exitRequest) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Exit request not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: exitRequest });
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

    const exitRequest = await ExitService.update(id, user.tenantId, body);
    if (!exitRequest) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Exit request not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: exitRequest });
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

    const exitRequest = await ExitService.delete(id, user.tenantId);
    if (!exitRequest) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'Exit request not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: exitRequest });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5000', message: error.message } },
      { status: 500 }
    );
  }
});
