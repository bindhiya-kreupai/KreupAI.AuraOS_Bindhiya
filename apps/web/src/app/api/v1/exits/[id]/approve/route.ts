import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { exitService, InvalidExitTransitionError } from '@/lib/services/exit.service';
import { withEnhancedAuth } from '@/lib/auth';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('exits:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing exits:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = params;

    const exitRequest = await exitService.approve(id, user.tenantId);
    if (!exitRequest) {
      return NextResponse.json(
        { success: false, error: { code: 'E4040', message: 'Exit request not found' } },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: exitRequest });
  } catch (error: any) {
    if (error instanceof InvalidExitTransitionError) {
      return NextResponse.json(
        { success: false, error: { code: 'E4090', message: error.message } },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: 'E3001', message: error.message } },
      { status: 400 }
    );
  }
});
