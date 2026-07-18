import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ShiftManagementService } from '@/lib/services/shift-management.service';
import { withEnhancedAuth } from '@/lib/auth';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('shift-swaps:update')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing shift-swaps:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = params;

    const swap = await ShiftManagementService.managerApproveSwap(id, user.tenantId, user.id);
    return NextResponse.json({ success: true, data: swap });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'E3001', message: error.message, messageAr: 'خطأ في الموافقة' },
      },
      { status: 400 }
    );
  }
});
