export const dynamic = 'force-dynamic';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';
import { z } from 'zod';

// API Response Standard
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    apiVersion: string;
  };
}

// Validation schema
const clockOutSchema = z.object({
  employeeId: z.string().uuid(),
  clockOutTime: z.string().datetime().optional(), // ISO 8601 format, defaults to now
  location: z
    .object({
      latitude: z.number().min(-90).max(90).optional().nullable(),
      longitude: z.number().min(-180).max(180).optional().nullable(),
      address: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  deviceInfo: z
    .object({
      deviceId: z.string().optional().nullable(),
      deviceType: z.enum(['WEB', 'MOBILE', 'BIOMETRIC', 'KIOSK']).default('WEB'),
      ipAddress: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  notes: z.string().max(500).optional().nullable(),
});

/**
 * POST /api/v1/attendance/clock-out
 * Record employee clock-out time
 */
export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context) => {
    const { permissions } = context;
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
    try {
      const body = await request.json();
      const tenantId = context.user.tenantId;

      // Validate request body
      const validationResult = clockOutSchema.safeParse(body);
      if (!validationResult.success) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E2001',
            message: 'Validation failed',
            details: { errors: validationResult.error.errors },
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };

        return NextResponse.json(response, { status: 400 });
      }

      const data = validationResult.data;
      const now = data.clockOutTime ? new Date(data.clockOutTime) : new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Find latest CLOCK_IN punch for today
      const clockInPunch = await prisma.attendancePunch.findFirst({
        where: {
          tenantId,
          employeeId: data.employeeId,
          punchDate: today,
          punchType: 'CLOCK_IN',
        },
        orderBy: { punchTime: 'desc' },
      });

      if (!clockInPunch) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E4001',
            message: 'No clock-in record found for today',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };

        return NextResponse.json(response, { status: 400 });
      }

      // Check if already clocked out after the last clock-in
      const existingClockOut = await prisma.attendancePunch.findFirst({
        where: {
          tenantId,
          employeeId: data.employeeId,
          punchDate: today,
          punchType: 'CLOCK_OUT',
          punchTime: { gt: clockInPunch.punchTime },
        },
      });

      if (existingClockOut) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E4002',
            message: 'Already clocked out for today',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };

        return NextResponse.json(response, { status: 400 });
      }

      // Build location string
      let locationStr: string | null = null;
      if (data.location) {
        const parts: string[] = [];
        if (data.location.latitude != null && data.location.longitude != null) {
          parts.push(`${data.location.latitude},${data.location.longitude}`);
        }
        if (data.location.address) {
          parts.push(data.location.address);
        }
        locationStr = parts.length > 0 ? parts.join(' - ') : null;
      }

      // Create the CLOCK_OUT punch
      const punch = await prisma.attendancePunch.create({
        data: {
          tenantId,
          employeeId: data.employeeId,
          punchDate: today,
          punchTime: now,
          punchType: 'CLOCK_OUT',
          location: locationStr,
          device: data.deviceInfo?.deviceType || 'WEB',
          ipAddress: data.deviceInfo?.ipAddress || null,
          notes: data.notes || null,
        },
      });

      // Calculate work duration
      const clockInTime = clockInPunch.punchTime;
      const workDurationMs = now.getTime() - clockInTime.getTime();
      const workDurationMinutes = Math.floor(workDurationMs / (1000 * 60));

      // Get shift info to determine overtime and early leave
      // Cast: the `shift` relation is not declared on ShiftAssignment in schema.prisma
      const shiftAssignment = await (prisma as any).shiftAssignment.findFirst({
        where: {
          tenantId,
          employeeId: data.employeeId,
          isActive: true,
          effectiveFrom: { lte: now },
          OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
        },
        include: { shift: true },
      });

      let shiftStartTime: string | null = null;
      let shiftEndTime: string | null = null;
      let lateMinutes = 0;
      let earlyLeaveMinutes = 0;
      let overtimeMinutes = 0;
      let expectedWorkMinutes = 480; // Default 8 hours

      if (shiftAssignment) {
        shiftStartTime = shiftAssignment.shift.startTime;
        shiftEndTime = shiftAssignment.shift.endTime;
        expectedWorkMinutes = Math.round(shiftAssignment.shift.workHours * 60);

        // Calculate late minutes
        const [shiftHour, shiftMin] = shiftStartTime!.split(':').map(Number);
        const graceIn = shiftAssignment.shift.graceInMinutes || 0;
        const expectedStart = new Date(today);
        expectedStart.setHours(shiftHour, shiftMin + graceIn, 0, 0);

        if (clockInTime > expectedStart) {
          lateMinutes = Math.floor((clockInTime.getTime() - expectedStart.getTime()) / (1000 * 60));
        }

        // Calculate early leave
        const [endHour, endMin] = shiftEndTime!.split(':').map(Number);
        const graceOut = shiftAssignment.shift.graceOutMinutes || 0;
        const expectedEnd = new Date(today);
        expectedEnd.setHours(endHour, endMin - graceOut, 0, 0);

        if (now < expectedEnd) {
          earlyLeaveMinutes = Math.floor((expectedEnd.getTime() - now.getTime()) / (1000 * 60));
        }

        // Calculate overtime
        if (shiftAssignment.shift.overtimeAllowed && workDurationMinutes > expectedWorkMinutes) {
          overtimeMinutes = workDurationMinutes - expectedWorkMinutes;
        }
      } else {
        // No shift: overtime is anything over 8 hours
        if (workDurationMinutes > expectedWorkMinutes) {
          overtimeMinutes = workDurationMinutes - expectedWorkMinutes;
        }
      }

      // Calculate break hours from BREAK_START / BREAK_END punches
      const breakPunches = await prisma.attendancePunch.findMany({
        where: {
          tenantId,
          employeeId: data.employeeId,
          punchDate: today,
          punchType: { in: ['BREAK_START', 'BREAK_END'] },
        },
        orderBy: { punchTime: 'asc' },
      });

      let breakMinutes = 0;
      for (let i = 0; i < breakPunches.length - 1; i += 2) {
        if (
          breakPunches[i].punchType === 'BREAK_START' &&
          breakPunches[i + 1]?.punchType === 'BREAK_END'
        ) {
          breakMinutes += Math.floor(
            (breakPunches[i + 1].punchTime.getTime() - breakPunches[i].punchTime.getTime()) /
              (1000 * 60)
          );
        }
      }

      const workHours = parseFloat(((workDurationMinutes - breakMinutes) / 60).toFixed(2));
      const breakHours = parseFloat((breakMinutes / 60).toFixed(2));
      const overtimeHours = parseFloat((overtimeMinutes / 60).toFixed(2));

      // Update AttendanceRecord
      await prisma.attendanceRecord.upsert({
        where: {
          tenantId_employeeId_date: {
            tenantId,
            employeeId: data.employeeId,
            date: today,
          },
        },
        create: {
          tenantId,
          employeeId: data.employeeId,
          date: today,
          clockIn: clockInTime,
          clockOut: now,
          workHours,
          breakHours,
          overtimeHours,
          status: 'PRESENT',
          isLate: lateMinutes > 0,
          isEarlyOut: earlyLeaveMinutes > 0,
          approvalStatus: 'PENDING',
        },
        update: {
          clockOut: now,
          workHours,
          breakHours,
          overtimeHours,
          isEarlyOut: earlyLeaveMinutes > 0,
          status: earlyLeaveMinutes > 0 ? 'EARLY_OUT' : 'PRESENT',
        },
      });

      // Look up employee info
      // tenant-ok: employee where clause is preceded by tenant-scoped lookup; relation traversal
      const employee = await prisma.employee.findUnique({
        where: { id: data.employeeId },
        select: { employeeCode: true, firstName: true, lastName: true },
      });

      const responseData = {
        id: punch.id,
        employeeId: data.employeeId,
        employeeCode: employee?.employeeCode || '',
        employeeName: employee ? `${employee.firstName} ${employee.lastName}` : '',
        date: today.toISOString().split('T')[0],
        clockInTime: clockInTime.toISOString(),
        clockOutTime: now.toISOString(),
        shiftStartTime,
        shiftEndTime,
        status: 'PRESENT',
        lateMinutes,
        earlyLeaveMinutes,
        workDurationMinutes: workDurationMinutes - breakMinutes,
        workDurationFormatted: `${Math.floor((workDurationMinutes - breakMinutes) / 60)}h ${(workDurationMinutes - breakMinutes) % 60}m`,
        overtimeMinutes,
        overtimeFormatted:
          overtimeMinutes > 0
            ? `${Math.floor(overtimeMinutes / 60)}h ${overtimeMinutes % 60}m`
            : '0h 0m',
        location: data.location,
        deviceInfo: data.deviceInfo,
        notes: data.notes,
        updatedAt: punch.updatedAt.toISOString(),
      };

      const response: ApiResponse = {
        success: true,
        data: responseData,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error: any) {
      console.error('[Clock-Out API] POST Error:', error);

      if (error instanceof Error && error.message.includes('not clocked in')) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E4001',
            message: 'No clock-in record found for today',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };

        return NextResponse.json(response, { status: 400 });
      }

      if (error instanceof Error && error.message.includes('already clocked out')) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E4002',
            message: 'Already clocked out for today',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };

        return NextResponse.json(response, { status: 400 });
      }

      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to record clock-out',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 500 });
    }
  }),
  {
    action: AuditAction.ATTENDANCE_MARKED,
    resourceType: 'attendance_punch',
    captureRequestBody: true,
  }
);
