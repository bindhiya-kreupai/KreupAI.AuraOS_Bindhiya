import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { z } from 'zod';

// API Response Standard
interface ApiResponse<T = any> {
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
  location: z.object({
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    address: z.string().optional().nullable(),
  }).optional().nullable(),
  deviceInfo: z.object({
    deviceId: z.string().optional().nullable(),
    deviceType: z.enum(['WEB', 'MOBILE', 'BIOMETRIC', 'KIOSK']).default('WEB'),
    ipAddress: z.string().optional().nullable(),
  }).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

/**
 * POST /api/v1/attendance/clock-out
 * Record employee clock-out time
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const body = await request.json();

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
    const clockOutTime = data.clockOutTime || new Date().toISOString();

    // TODO: Implement actual clock-out logic
    // 1. Check if employee exists and is active
    // 2. Get today's attendance record
    // 3. Verify employee has clocked in today
    // 4. Validate geofencing if enabled
    // 5. Calculate work duration
    // 6. Calculate overtime if applicable
    // 7. Update attendance record
    // 8. Send summary notification

    const clockInTime = new Date(clockOutTime);
    clockInTime.setHours(9, 15, 0, 0); // Mock: clocked in at 9:15 AM

    const workDurationMs = new Date(clockOutTime).getTime() - clockInTime.getTime();
    const workDurationMinutes = Math.floor(workDurationMs / (1000 * 60));
    const expectedWorkMinutes = 9 * 60; // 9 hours
    const overtimeMinutes = Math.max(0, workDurationMinutes - expectedWorkMinutes);

    const mockAttendance = {
      id: crypto.randomUUID(),
      employeeId: data.employeeId,
      employeeCode: 'EMP001',
      employeeName: 'John Doe',
      date: new Date(clockOutTime).toISOString().split('T')[0],
      clockInTime: clockInTime.toISOString(),
      clockOutTime,
      shiftStartTime: '09:00:00',
      shiftEndTime: '18:00:00',
      status: 'PRESENT',
      lateMinutes: 15,
      earlyLeaveMinutes: 0,
      workDurationMinutes,
      workDurationFormatted: `${Math.floor(workDurationMinutes / 60)}h ${workDurationMinutes % 60}m`,
      overtimeMinutes,
      overtimeFormatted: overtimeMinutes > 0 ? `${Math.floor(overtimeMinutes / 60)}h ${overtimeMinutes % 60}m` : '0h 0m',
      location: data.location,
      deviceInfo: data.deviceInfo,
      notes: data.notes,
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: mockAttendance,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
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
});
