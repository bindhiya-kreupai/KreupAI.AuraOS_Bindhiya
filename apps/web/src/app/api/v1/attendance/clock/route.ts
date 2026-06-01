import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/attendance/clock
 * Clock in or clock out for an employee
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

    // Create the attendance punch record
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

    // If clocking in or out, update/create the attendance record for the day
    if (type === 'CLOCK_IN' || type === 'CLOCK_OUT') {
      const dateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const existingRecord = await prisma.attendanceRecord.findFirst({
        where: { tenantId: user.tenantId, employeeId: empId, date: dateOnly },
      });

      if (existingRecord) {
        await prisma.attendanceRecord.update({
          where: { id: existingRecord.id },
          data: {
            ...(type === 'CLOCK_IN' && !existingRecord.clockIn ? { clockIn: now } : {}),
            ...(type === 'CLOCK_OUT' ? { clockOut: now } : {}),
            status: 'PRESENT',
          },
        });
      } else if (type === 'CLOCK_IN') {
        await prisma.attendanceRecord.create({
          data: {
            tenantId: user.tenantId,
            employeeId: empId,
            date: dateOnly,
            clockIn: now,
            status: 'PRESENT',
            approvalStatus: 'PENDING',
          },
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: punch,
        message: `${type === 'CLOCK_IN' ? 'Clocked in' : type === 'CLOCK_OUT' ? 'Clocked out' : type} successfully`,
        meta: { timestamp: now.toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
      },
      { status: 201 }
    );
  } catch (error) {
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
