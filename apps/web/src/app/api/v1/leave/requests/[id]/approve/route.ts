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
const approveLeaveSchema = z.object({
  approverId: z.string().uuid(),
  comments: z.string().max(500).optional().nullable(),
  effectiveStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  effectiveEndDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
});

/**
 * PUT /api/v1/leave/requests/:id/approve
 * Approve a leave request
 */
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const { id } = params;
      const body = await request.json();

      // Validate request body
      const validationResult = approveLeaveSchema.safeParse(body);
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

      // TODO: Implement actual leave approval logic
      // 1. Check if approver has permission
      // 2. Verify leave request exists and is in PENDING status
      // 3. Check approval workflow level
      // 4. Update leave request status
      // 5. Deduct leave balance if final approval
      // 6. Send notification to employee
      // 7. Notify next approver if multi-level approval
      // 8. Update calendar entries

      const mockApprovedLeave = {
        id,
        applicationNumber: 'LA-2024-1234',
        employeeId: crypto.randomUUID(),
        employeeName: 'John Doe',
        leavePolicyId: crypto.randomUUID(),
        leaveType: 'Annual Leave',
        startDate: '2024-12-27',
        endDate: '2024-12-29',
        totalDays: 3,
        status: 'APPROVED',
        approvedBy: data.approverId,
        approvedAt: new Date().toISOString(),
        approverComments: data.comments,
        effectiveStartDate: data.effectiveStartDate || '2024-12-27',
        effectiveEndDate: data.effectiveEndDate || '2024-12-29',
        approvalHistory: [
          {
            level: 1,
            approverName: 'Direct Manager',
            status: 'APPROVED',
            approvedAt: new Date().toISOString(),
            comments: data.comments,
          },
        ],
        updatedAt: new Date().toISOString(),
      };

      const response: ApiResponse = {
        success: true,
        data: mockApprovedLeave,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('[Leave Approval API] PUT Error:', error);

      if (error instanceof Error && error.message.includes('not found')) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E3001',
            message: 'Leave request not found',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };

        return NextResponse.json(response, { status: 404 });
      }

      if (error instanceof Error && error.message.includes('permission')) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E4001',
            message: 'Insufficient permissions to approve this leave request',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };

        return NextResponse.json(response, { status: 403 });
      }

      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to approve leave request',
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
