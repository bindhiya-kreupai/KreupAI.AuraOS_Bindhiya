/**
 * Attendance Management API Routes
 * Phase 2: Core Enhancement - Attendance Enhancement
 */

import { NextRequest, NextResponse } from 'next/server';
import { AttendanceService } from '@/lib/services/attendance';

/**
 * GET /api/attendance
 * Get attendance records
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const employeeId = searchParams.get('employeeId');
    const date = searchParams.get('date');
    const month = searchParams.get('month');
    const type = searchParams.get('type') || 'records'; // 'records' | 'summary' | 'calendar'

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
        { status: 400 }
      );
    }

    switch (type) {
      case 'summary':
        if (!employeeId || !month) {
          return NextResponse.json(
            {
              error: 'employeeId and month are required for summary',
              errorAr: 'معرف الموظف والشهر مطلوبان للملخص',
            },
            { status: 400 }
          );
        }
        const summary = await AttendanceService.getMonthlyAttendance(employeeId, month);
        return NextResponse.json({
          success: true,
          data: summary,
        });

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
  } catch (error) {
    console.error('Attendance fetch error:', error);
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
    const body = await request.json();
    const action = body.action || 'process';

    if (!body.tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
        { status: 400 }
      );
    }

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
          tenantId: body.tenantId,
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
    console.error('Attendance processing error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process attendance',
        errorAr: 'فشل في معالجة الحضور',
      },
      { status: 500 }
    );
  }
}
