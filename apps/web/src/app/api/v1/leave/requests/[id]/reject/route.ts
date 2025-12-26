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
const rejectLeaveSchema = z.object({
  approverId: z.string().uuid(),
  reason: z.string().min(10).max(500),
  comments: z.string().max(500).optional().nullable(),
});

/**
 * PUT /api/v1/leave/requests/:id/reject
 * Reject a leave request
 */
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    try {
      const { id } = params;
      const body = await request.json();

      // Validate request body
      const validationResult = rejectLeaveSchema.safeParse(body);
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

      // TODO: Implement actual leave rejection logic
      // 1. Check if approver has permission
      // 2. Verify leave request exists and is in PENDING status
      // 3. Update leave request status to REJECTED
      // 4. Send notification to employee with rejection reason
      // 5. Update calendar entries
      // 6. Log rejection in audit trail

      const mockRejectedLeave = {
        id,
        applicationNumber: 'LA-2024-1234',
        employeeId: crypto.randomUUID(),
        employeeName: 'John Doe',
        leavePolicyId: crypto.randomUUID(),
        leaveType: 'Annual Leave',
        startDate: '2024-12-27',
        endDate: '2024-12-29',
        totalDays: 3,
        status: 'REJECTED',
        rejectedBy: data.approverId,
        rejectedAt: new Date().toISOString(),
        rejectionReason: data.reason,
        rejectionComments: data.comments,
        approvalHistory: [
          {
            level: 1,
            approverName: 'Direct Manager',
            status: 'REJECTED',
            rejectedAt: new Date().toISOString(),
            reason: data.reason,
            comments: data.comments,
          },
        ],
        updatedAt: new Date().toISOString(),
      };

      const response: ApiResponse = {
        success: true,
        data: mockRejectedLeave,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('[Leave Rejection API] PUT Error:', error);

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
            message: 'Insufficient permissions to reject this leave request',
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
          message: 'Failed to reject leave request',
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
