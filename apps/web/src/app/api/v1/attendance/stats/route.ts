import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { TimeTrackingService } from '@/lib/services/time-tracking.service';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('attendance:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing attendance:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);

    const employeeId = searchParams.get('employeeId') || undefined;
    const month = searchParams.get('month') || undefined;

    const stats = await TimeTrackingService.getStatistics(user.tenantId, employeeId, month);
    return NextResponse.json({ success: true, data: stats });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5000', message: error.message } },
      { status: 500 }
    );
  }
});
