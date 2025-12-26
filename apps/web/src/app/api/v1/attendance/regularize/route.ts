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
const regularizeAttendanceSchema = z.object({
  employeeId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  clockInTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  clockOutTime: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
  reason: z.string().min(20).max(500),
  attachments: z.array(z.string()).optional().nullable(),
});

/**
 * POST /api/v1/attendance/regularize
 * Submit attendance regularization request for missed clock-in/out
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const body = await request.json();

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

    // TODO: Implement actual regularization logic
    // 1. Check if date is in past (cannot regularize future dates)
    // 2. Check if date is within allowed regularization period
    // 3. Get existing attendance record if any
    // 4. Create regularization request
    // 5. Send for manager approval
    // 6. Calculate work duration
    // 7. Send notification to approver

    const workDurationMs = clockOut.getTime() - clockIn.getTime();
    const workDurationMinutes = Math.floor(workDurationMs / (1000 * 60));

    const mockRegularizationRequest = {
      id: crypto.randomUUID(),
      requestNumber: `AR-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      ...data,
      employeeCode: 'EMP001',
      employeeName: 'John Doe',
      workDurationMinutes,
      workDurationFormatted: `${Math.floor(workDurationMinutes / 60)}h ${workDurationMinutes % 60}m`,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
      approvalWorkflow: [
        {
          level: 1,
          approverName: 'Direct Manager',
          status: 'PENDING',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: mockRegularizationRequest,
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
