import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/attendance/summary
 * Get monthly attendance summary for an employee
 */
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

    const employeeId = searchParams.get('employeeId') || user.employeeId;
    const month = searchParams.get('month') || String(new Date().getMonth() + 1).padStart(2, '0');
    const year = searchParams.get('year') || String(new Date().getFullYear());

    const startDate = new Date(`${year}-${month}-01`);
    const endDate = new Date(parseInt(year), parseInt(month), 0); // last day of month

    const records = await prisma.attendanceRecord.findMany({
      where: {
        tenantId: user.tenantId,
        employeeId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    // Aggregate summary
    const summary = {
      employeeId,
      month,
      year,
      totalWorkingDays: records.length,
      presentDays: records.filter((r) => r.status === 'PRESENT').length,
      absentDays: records.filter((r) => r.status === 'ABSENT').length,
      halfDays: records.filter((r) => r.status === 'HALF_DAY').length,
      lateDays: records.filter((r) => r.isLate).length,
      earlyOutDays: records.filter((r) => r.isEarlyOut).length,
      leaveDays: records.filter((r) => r.status === 'ON_LEAVE').length,
      holidayDays: records.filter((r) => r.status === 'HOLIDAY').length,
      weekOffDays: records.filter((r) => r.status === 'WEEK_OFF').length,
      totalWorkHours: records.reduce((sum, r) => sum + r.workHours, 0),
      totalOvertimeHours: records.reduce((sum, r) => sum + r.overtimeHours, 0),
      regularizedCount: records.filter((r) => r.isRegularized).length,
      records,
    };

    return NextResponse.json({
      success: true,
      data: summary,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error) {
    console.error('[Attendance Summary API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch attendance summary' } },
      { status: 500 }
    );
  }
});
