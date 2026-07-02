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
const clockInSchema = z.object({
  employeeId: z.string().uuid(),
  clockInTime: z.string().datetime().optional(), // ISO 8601 format, defaults to now
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
 * POST /api/v1/attendance/clock-in
 * Record employee clock-in time
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
      const validationResult = clockInSchema.safeParse(body);
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
      const now = data.clockInTime ? new Date(data.clockInTime) : new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Check if employee already has a CLOCK_IN punch today without a CLOCK_OUT
      const existingPunch = await prisma.attendancePunch.findFirst({
        where: {
          tenantId,
          employeeId: data.employeeId,
          punchDate: today,
          punchType: 'CLOCK_IN',
        },
        orderBy: { punchTime: 'desc' },
      });

      if (existingPunch) {
        // Check if there is a corresponding CLOCK_OUT
        const clockOutPunch = await prisma.attendancePunch.findFirst({
          where: {
            tenantId,
            employeeId: data.employeeId,
            punchDate: today,
            punchType: 'CLOCK_OUT',
            punchTime: { gt: existingPunch.punchTime },
          },
        });

        if (!clockOutPunch) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'E4001',
              message: 'Already clocked in for today',
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
              apiVersion: 'v1',
            },
          };

          return NextResponse.json(response, { status: 400 });
        }
      }

      // Build location string from coordinates
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

      // Create the punch record
      const punch = await prisma.attendancePunch.create({
        data: {
          tenantId,
          employeeId: data.employeeId,
          punchDate: today,
          punchTime: now,
          punchType: 'CLOCK_IN',
          location: locationStr,
          device: data.deviceInfo?.deviceType || 'WEB',
          ipAddress: data.deviceInfo?.ipAddress || null,
          notes: data.notes || null,
        },
      });

      // Look up employee info
      const employee = await prisma.employee.findUnique({
        where: { id: data.employeeId },
        select: { employeeCode: true, firstName: true, lastName: true },
      });

      // Check for active shift assignment to determine late status
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

      let status = 'ON_TIME';
      let lateMinutes = 0;
      let shiftStartTime: string | null = null;
      let shiftEndTime: string | null = null;

      if (shiftAssignment) {
        shiftStartTime = shiftAssignment.shift.startTime;
        shiftEndTime = shiftAssignment.shift.endTime;

        // Parse shift start time (HH:MM)
        const [shiftHour, shiftMin] = shiftStartTime!.split(':').map(Number);
        const graceMinutes = shiftAssignment.shift.graceInMinutes || 0;
        const shiftStartDate = new Date(today);
        shiftStartDate.setHours(shiftHour, shiftMin + graceMinutes, 0, 0);

        if (now > shiftStartDate) {
          lateMinutes = Math.floor((now.getTime() - shiftStartDate.getTime()) / (1000 * 60));
          status = 'LATE';
        }
      }

      // Upsert attendance record for today
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
          shiftId: shiftAssignment?.shiftId || null,
          shiftStartTime: shiftStartTime
            ? new Date(`${today.toISOString().split('T')[0]}T${shiftStartTime}:00`)
            : null,
          shiftEndTime: shiftEndTime
            ? new Date(`${today.toISOString().split('T')[0]}T${shiftEndTime}:00`)
            : null,
          clockIn: now,
          status: status === 'LATE' ? 'LATE' : 'PRESENT',
          isLate: status === 'LATE',
          approvalStatus: 'PENDING',
        },
        update: {
          clockIn: now,
          shiftId: shiftAssignment?.shiftId || undefined,
          isLate: status === 'LATE',
          status: status === 'LATE' ? 'LATE' : 'PRESENT',
        },
      });

      const responseData = {
        id: punch.id,
        employeeId: data.employeeId,
        employeeCode: employee?.employeeCode || '',
        employeeName: employee ? `${employee.firstName} ${employee.lastName}` : '',
        date: today.toISOString().split('T')[0],
        clockInTime: now.toISOString(),
        shiftStartTime,
        shiftEndTime,
        status,
        lateMinutes,
        location: data.location,
        deviceInfo: data.deviceInfo,
        notes: data.notes,
        clockOutTime: null,
        workDuration: null,
        overtimeMinutes: null,
        createdAt: punch.createdAt.toISOString(),
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

      return NextResponse.json(response, { status: 201 });
    } catch (error: any) {
      console.error('[Clock-In API] POST Error:', error);

      if (error instanceof Error && error.message.includes('already clocked in')) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E4001',
            message: 'Already clocked in for today',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };

        return NextResponse.json(response, { status: 400 });
      }

      if (error instanceof Error && error.message.includes('geofence')) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E4002',
            message: 'Clock-in location is outside allowed geofence',
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
          message: 'Failed to record clock-in',
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
