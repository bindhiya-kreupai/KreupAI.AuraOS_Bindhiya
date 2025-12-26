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

// Validation schemas
const applyLeaveSchema = z.object({
  tenantId: z.string().uuid(),
  employeeId: z.string().uuid(),
  leavePolicyId: z.string().uuid(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  leaveType: z.enum(['FULL_DAY', 'HALF_DAY', 'SHORT_LEAVE']).default('FULL_DAY'),
  halfDayPeriod: z.enum(['FIRST_HALF', 'SECOND_HALF']).optional().nullable(),
  reason: z.string().min(10).max(500),
  emergencyContact: z.string().optional().nullable(),
  attachments: z.array(z.string()).optional().nullable(),
  notifyTo: z.array(z.string().uuid()).optional().nullable(),
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  }
).refine(
  (data) => {
    if (data.leaveType === 'HALF_DAY') {
      return data.halfDayPeriod !== null && data.halfDayPeriod !== undefined;
    }
    return true;
  },
  {
    message: 'Half day period is required for half-day leave',
    path: ['halfDayPeriod'],
  }
);

/**
 * POST /api/v1/leave/apply
 * Submit a new leave application
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = applyLeaveSchema.safeParse(body);
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

    // TODO: Implement actual leave application logic
    // 1. Check employee leave balance
    // 2. Check for overlapping leave requests
    // 3. Validate against company leave policy
    // 4. Check for blackout dates/restricted periods
    // 5. Calculate total leave days
    // 6. Send notification to approvers
    // 7. Create leave application record

    const mockLeaveApplication = {
      id: crypto.randomUUID(),
      applicationNumber: `LA-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      ...data,
      totalDays: 1, // Calculate based on start/end dates
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
      approvalWorkflow: [
        {
          level: 1,
          approverName: 'Direct Manager',
          status: 'PENDING',
        },
        {
          level: 2,
          approverName: 'HR Manager',
          status: 'PENDING',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: mockLeaveApplication,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('[Leave Application API] POST Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to submit leave application',
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
