import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { shiftAttendanceService } from '@/lib/services/shift-management/shift-attendance.service';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/attendance/clock
 * Clock in, clock out, or break for an employee — shift-aware for late/overtime detection
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('attendance:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing attendance:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();

    const { type, location, device, notes, employeeId } = body;

    if (!type || !['CLOCK_IN', 'CLOCK_OUT', 'BREAK_START', 'BREAK_END'].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'Valid punch type is required: CLOCK_IN, CLOCK_OUT, BREAK_START, BREAK_END',
          },
        },
        { status: 400 }
      );
    }

    const empId = employeeId || user.employeeId;
    const now = new Date();

    if (type === 'CLOCK_IN') {
      const result = await shiftAttendanceService.processClockIn(user.tenantId, empId, now);
      return NextResponse.json(
        {
          success: true,
          data: { ...result, punch: result.punchId },
          message:
            result.status === 'LATE'
              ? `Clocked in (${result.lateMinutes} min late)`
              : 'Clocked in successfully',
          meta: { timestamp: now.toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
        },
        { status: 201 }
      );
    }

    if (type === 'CLOCK_OUT') {
      const result = await shiftAttendanceService.processClockOut(user.tenantId, empId, now);
      return NextResponse.json(
        {
          success: true,
          data: result,
          message: 'Clocked out successfully',
          meta: { timestamp: now.toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
        },
        { status: 201 }
      );
    }

    // BREAK_START / BREAK_END — simple punch creation, no shift validation
    const punch = await prisma.attendancePunch.create({
      data: {
        tenantId: user.tenantId,
        employeeId: empId,
        punchDate: now,
        punchTime: now,
        punchType: type,
        location: location || null,
        device: device || 'Web',
        ipAddress:
          request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null,
        notes: notes || null,
        isVerified: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: punch,
        message: `${type === 'BREAK_START' ? 'Break started' : 'Break ended'} successfully`,
        meta: { timestamp: now.toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Attendance Clock API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to record attendance punch',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
      },
      { status: 500 }
    );
  }
});
