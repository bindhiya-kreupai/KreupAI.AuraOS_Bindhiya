import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { LeaveService } from '@/lib/services/leave.service';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('leave-requests:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing leave-requests:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);

    const employeeId = searchParams.get('employeeId') || undefined;

    const stats = await LeaveService.getRequestStatistics(user.tenantId, employeeId);

    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
});
