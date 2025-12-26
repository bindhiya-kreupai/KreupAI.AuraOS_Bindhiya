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
const encashLeaveSchema = z.object({
  tenantId: z.string().uuid(),
  employeeId: z.string().uuid(),
  leavePolicyId: z.string().uuid(),
  numberOfDays: z.number().int().min(1),
  reason: z.string().min(10).max(500).optional().nullable(),
  requestedPaymentMonth: z.string().regex(/^\d{4}-\d{2}$/),
});

/**
 * POST /api/v1/leave/encash
 * Submit a leave encashment request
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = encashLeaveSchema.safeParse(body);
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

    // TODO: Implement actual leave encashment logic
    // 1. Check if leave policy allows encashment
    // 2. Verify employee has sufficient leave balance
    // 3. Check maximum encashment limit
    // 4. Calculate encashment amount based on policy rate
    // 5. Create encashment request
    // 6. Deduct leave balance
    // 7. Send for approval
    // 8. Add to payroll upon approval

    const mockEncashmentRequest = {
      id: crypto.randomUUID(),
      requestNumber: `LE-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      ...data,
      leaveType: 'Annual Leave',
      currentBalance: 15,
      encashmentRate: 100, // Percentage of basic salary
      basicSalary: 5000,
      perDayRate: 166.67, // basicSalary / 30
      encashmentAmount: 1666.7, // numberOfDays * perDayRate * (encashmentRate / 100)
      balanceAfterEncashment: 5, // currentBalance - numberOfDays
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
      approvalWorkflow: [
        {
          level: 1,
          approverName: 'HR Manager',
          status: 'PENDING',
        },
        {
          level: 2,
          approverName: 'Finance Manager',
          status: 'PENDING',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const response: ApiResponse = {
      success: true,
      data: mockEncashmentRequest,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('[Leave Encashment API] POST Error:', error);

    if (error instanceof Error && error.message.includes('not allowed')) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E4001',
          message: 'Leave encashment not allowed for this leave type',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 400 });
    }

    if (error instanceof Error && error.message.includes('insufficient balance')) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E4002',
          message: 'Insufficient leave balance for encashment',
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
        message: 'Failed to submit leave encashment request',
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
