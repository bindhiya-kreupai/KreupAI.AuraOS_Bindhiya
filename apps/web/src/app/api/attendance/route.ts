/**
 * Attendance Management API Routes
 * Phase 2: Core Enhancement - Attendance Enhancement
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { AttendanceService } from '@/lib/services/attendance';
import { getSessionOrError, type Session } from '@/lib/auth/session';
import { prisma } from '@aura/database';

/**
 * GET /api/attendance
 * Get attendance records
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated session - tenantId comes from JWT, not query params
    const sessionResult = getSessionOrError(request);
    if (sessionResult instanceof NextResponse) {
      return sessionResult;
    }
    const session: Session = sessionResult;
    const tenantId = session.tenantId;

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const month = searchParams.get('month');
    const type = searchParams.get('type') || 'records'; // 'records' | 'summary' | 'calendar'

    switch (type) {
      case 'summary': {
        if (!employeeId || !month) {
          return NextResponse.json(
            {
              error: 'employeeId and month are required for summary',
              errorAr: 'معرف الموظف والشهر مطلوبان للملخص',
            },
            { status: 400 }
          );
        }
        // Cross-tenant guard: verify employeeId belongs to the authenticated tenant
        const summaryOwnership = await prisma.employee.findFirst({
          where: { id: employeeId, company: { tenantId } },
          select: { id: true },
        });
        if (!summaryOwnership) {
          return NextResponse.json(
            { error: 'Employee not found', errorAr: 'لم يتم العثور على الموظف' },
            { status: 404 }
          );
        }
        const summary = await AttendanceService.getMonthlyAttendance(employeeId, month);
        return NextResponse.json({
          success: true,
          data: summary,
        });
      }

      case 'calendar':
        // Return calendar view data
        return NextResponse.json({
          success: true,
          data: {
            calendar: [],
            holidays: [],
            leaves: [],
          },
        });

      case 'records':
      default:
        // Return attendance records
        return NextResponse.json({
          success: true,
          data: {
            records: [],
            pagination: {
              page: 1,
              limit: 10,
              total: 0,
            },
          },
        });
    }
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch attendance data', errorAr: 'فشل في جلب بيانات الحضور' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/attendance
 * Process daily attendance
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated session - tenantId comes from JWT, not request body
    const sessionResult = getSessionOrError(request);
    if (sessionResult instanceof NextResponse) {
      return sessionResult;
    }
    const session: Session = sessionResult;
    const tenantId = session.tenantId;

    const body = await request.json();
    const action = body.action || 'process';

    switch (action) {
      case 'process':
        // Process daily attendance
        if (!body.date) {
          return NextResponse.json(
            { error: 'date is required for processing', errorAr: 'التاريخ مطلوب للمعالجة' },
            { status: 400 }
          );
        }

        const result = await AttendanceService.processDailyAttendance({
          tenantId,
          date: body.date,
          employeeIds: body.employeeIds,
          reprocess: body.reprocess || false,
        });

        return NextResponse.json({
          success: true,
          data: result,
        });

      case 'punch':
        // Record a punch
        if (!body.employeeId || !body.punchType) {
          return NextResponse.json(
            {
              error: 'employeeId and punchType are required',
              errorAr: 'معرف الموظف ونوع البصمة مطلوبان',
            },
            { status: 400 }
          );
        }

        // Cross-tenant guard: verify body.employeeId belongs to the authenticated tenant
        // before calling the service. AttendanceService.recordPunch does not currently
        // accept a tenantId argument, so the route owns this check.
        const employeeOwnership = await prisma.employee.findFirst({
          where: { id: body.employeeId, company: { tenantId } },
          select: { id: true },
        });
        if (!employeeOwnership) {
          return NextResponse.json(
            { error: 'Employee not found', errorAr: 'لم يتم العثور على الموظف' },
            { status: 404 }
          );
        }

        const punch = await AttendanceService.recordPunch(
          body.employeeId,
          body.punchType,
          body.source || 'WEB',
          body.location,
          body.deviceId,
          body.photoUrl
        );

        return NextResponse.json({
          success: true,
          data: punch,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action', errorAr: 'إجراء غير صالح' },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process attendance',
        errorAr: 'فشل في معالجة الحضور',
      },
      { status: 500 }
    );
  }
}
