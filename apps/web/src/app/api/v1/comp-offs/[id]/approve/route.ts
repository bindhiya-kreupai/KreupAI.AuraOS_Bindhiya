import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { OvertimeService } from '@/lib/services/overtime.service';
import { withEnhancedAuth } from '@/lib/auth';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('comp-offs:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing comp-offs:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = params;

    const compOff = await OvertimeService.approveCompOff(id, user.tenantId, user.id);
    return NextResponse.json({ success: true, data: compOff });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E3001', message: error.message } },
      { status: 400 }
    );
  }
});
