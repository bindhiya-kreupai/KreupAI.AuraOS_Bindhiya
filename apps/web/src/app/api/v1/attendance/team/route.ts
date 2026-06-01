import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/attendance/team
 * Get team attendance for managers (shows reportees' attendance)
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

    const managerId = searchParams.get('managerId') || user.employeeId;
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const skip = (page - 1) * limit;

    // Get all direct reports of the manager
    const directReports = await prisma.employee.findMany({
      where: { managerId, isDeleted: false },
      select: { id: true, firstName: true, lastName: true, employeeCode: true, departmentId: true },
    });

    const reporteeIds = directReports.map((e) => e.id);

    if (reporteeIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        meta: {
          managerId,
          date,
          pagination: { page, limit, total: 0, totalPages: 0 },
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      });
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate()
    );
    const endOfDay = new Date(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate() + 1
    );

    const [attendanceRecords, total] = await Promise.all([
      prisma.attendanceRecord.findMany({
        where: {
          tenantId: user.tenantId,
          employeeId: { in: reporteeIds },
          date: { gte: startOfDay, lt: endOfDay },
        },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      prisma.attendanceRecord.count({
        where: {
          tenantId: user.tenantId,
          employeeId: { in: reporteeIds },
          date: { gte: startOfDay, lt: endOfDay },
        },
      }),
    ]);

    // Merge employee info with attendance
    const recordMap = new Map(attendanceRecords.map((r) => [r.employeeId, r]));
    const teamAttendance = directReports.slice(skip, skip + limit).map((emp) => ({
      employee: emp,
      attendance: recordMap.get(emp.id) || null,
      status: recordMap.get(emp.id)?.status || 'NOT_RECORDED',
    }));

    return NextResponse.json({
      success: true,
      data: teamAttendance,
      meta: {
        managerId,
        date,
        totalTeamMembers: directReports.length,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[Attendance Team API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch team attendance' } },
      { status: 500 }
    );
  }
});
