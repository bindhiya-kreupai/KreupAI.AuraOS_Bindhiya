import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ShiftManagementService } from '@/lib/services/shift-management.service';
import { withEnhancedAuth } from '@/lib/auth';

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('shifts:read')) {
      return NextResponse.json(
        { success: false, error: { code: 'E4030', message: 'Forbidden', messageAr: 'ممنوع' } },
        { status: 403 }
      );
    }
    const body = await request.json();
    const { employeeId, date, excludeRosterId } = body;

    if (!employeeId || !date) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E2001', message: 'employeeId and date are required', messageAr: 'مطلوب' },
        },
        { status: 400 }
      );
    }

    const conflicts = await ShiftManagementService.checkConflicts({
      employeeId,
      date,
      tenantId: user.tenantId,
      excludeRosterId,
    });

    return NextResponse.json({
      success: true,
      data: conflicts,
      meta: {
        hasConflicts: conflicts.length > 0,
        hasErrors: conflicts.some((c) => c.severity === 'error'),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'E5000', message: 'Internal server error', messageAr: 'خطأ في الخادم' },
      },
      { status: 500 }
    );
  }
});
