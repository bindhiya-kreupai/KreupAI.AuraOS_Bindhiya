import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

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

/**
 * GET /api/v1/leave/balance/:employeeId
 * Get leave balance for an employee across all leave types
 *
 * Query Parameters:
 * - year (optional): Year for leave balance (defaults to current year)
 */
export const GET = withEnhancedAuth(
  async (request: NextRequest, { params }: { params: { employeeId: string } }) => {
    try {
      const { employeeId } = params;
      const { searchParams } = new URL(request.url);
      const year = searchParams.get('year') || new Date().getFullYear().toString();

      // TODO: Implement actual leave balance calculation
      // 1. Get employee's applicable leave policies
      // 2. Calculate accrued leave based on joining date and accrual type
      // 3. Get utilized leave for the year
      // 4. Calculate carry forward from previous year
      // 5. Calculate pending leave requests
      // 6. Calculate available balance

      const mockLeaveBalance = {
        employeeId,
        employeeCode: 'EMP001',
        employeeName: 'John Doe',
        year: parseInt(year),
        balances: [
          {
            leavePolicyId: crypto.randomUUID(),
            leaveType: 'Annual Leave',
            leaveTypeCode: 'AL',
            annualEntitlement: 21,
            accrued: 21, // Based on accrual type and months
            utilized: 8,
            pending: 3, // Leave requests in PENDING status
            carriedForward: 2,
            encashed: 0,
            lapsed: 0,
            available: 12, // accrued + carriedForward - utilized - pending
            maxCarryForward: 5,
            canEncash: true,
            maxEncashment: 10,
          },
          {
            leavePolicyId: crypto.randomUUID(),
            leaveType: 'Sick Leave',
            leaveTypeCode: 'SL',
            annualEntitlement: 12,
            accrued: 12,
            utilized: 4,
            pending: 0,
            carriedForward: 0,
            encashed: 0,
            lapsed: 0,
            available: 8,
            maxCarryForward: 0,
            canEncash: false,
            maxEncashment: 0,
          },
          {
            leavePolicyId: crypto.randomUUID(),
            leaveType: 'Casual Leave',
            leaveTypeCode: 'CL',
            annualEntitlement: 7,
            accrued: 7,
            utilized: 3,
            pending: 1,
            carriedForward: 0,
            encashed: 0,
            lapsed: 0,
            available: 3,
            maxCarryForward: 0,
            canEncash: false,
            maxEncashment: 0,
          },
        ],
        summary: {
          totalEntitlement: 40,
          totalAccrued: 40,
          totalUtilized: 15,
          totalPending: 4,
          totalAvailable: 23,
          totalCarriedForward: 2,
        },
        generatedAt: new Date().toISOString(),
      };

      const response: ApiResponse = {
        success: true,
        data: mockLeaveBalance,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('[Leave Balance API] GET Error:', error);

      if (error instanceof Error && error.message.includes('not found')) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E3001',
            message: 'Employee not found',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };

        return NextResponse.json(response, { status: 404 });
      }

      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch leave balance',
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
  }
);
