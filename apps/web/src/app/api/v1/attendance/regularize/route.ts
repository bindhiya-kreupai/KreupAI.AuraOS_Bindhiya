export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
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
const regularizeAttendanceSchema = z.object({
  employeeId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  clockInTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  clockOutTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  reason: z.string().min(20).max(500),
  regularizationType: z.string().optional(),
  attachments: z.array(z.string()).optional().nullable(),
});

/**
 * POST /api/v1/attendance/regularize
 * Submit attendance regularization request for missed clock-in/out
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const body = await request.json();
    const tenantId = context.user.tenantId;

    // Validate request body
    const validationResult = regularizeAttendanceSchema.safeParse(body);
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

    // Validate that clockOutTime is after clockInTime
    const clockIn = new Date(`${data.date}T${data.clockInTime}`);
    const clockOut = new Date(`${data.date}T${data.clockOutTime}`);

    if (clockOut <= clockIn) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Clock-out time must be after clock-in time',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 400 });
    }

    // Validate date is in the past
    const regularizeDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (regularizeDate >= today) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E2001',
          message: 'Cannot regularize attendance for today or future dates',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 400 });
    }

    // Create the regularization request
    const regularization = await prisma.attendanceRegularization.create({
      data: {
        tenantId,
        employeeId: data.employeeId,
        date: regularizeDate,
        regularizationType: data.regularizationType || 'MISSED_PUNCH',
        requestedClockIn: clockIn,
        requestedClockOut: clockOut,
        reason: data.reason,
        attachments: data.attachments || [],
        status: 'PENDING',
      },
    });

    // Look up employee info
    const employee = await prisma.employee.findUnique({
      where: { id: data.employeeId },
      select: { employeeCode: true, firstName: true, lastName: true },
    });

    // Calculate work duration
    const workDurationMs = clockOut.getTime() - clockIn.getTime();
    const workDurationMinutes = Math.floor(workDurationMs / (1000 * 60));

    const responseData = {
      id: regularization.id,
      ...data,
      employeeCode: employee?.employeeCode || '',
      employeeName: employee ? `${employee.firstName} ${employee.lastName}` : '',
      workDurationMinutes,
      workDurationFormatted: `${Math.floor(workDurationMinutes / 60)}h ${workDurationMinutes % 60}m`,
      status: 'PENDING',
      submittedAt: regularization.createdAt.toISOString(),
      createdAt: regularization.createdAt.toISOString(),
      updatedAt: regularization.updatedAt.toISOString(),
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
  } catch (error) {
    console.error('[Attendance Regularization API] POST Error:', error);

    if (error instanceof Error && error.message.includes('past allowed period')) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E4001',
          message: 'Date is beyond allowed regularization period',
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
        message: 'Failed to submit attendance regularization request',
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
