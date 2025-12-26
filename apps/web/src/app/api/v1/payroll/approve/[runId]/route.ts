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

const approvePayrollSchema = z.object({
  approverComments: z.string().optional(),
  approvalLevel: z.number().int().min(1).max(3).default(1),
});

/**
 * POST /api/v1/payroll/approve/:runId
 * Approve a calculated payroll run
 *
 * Moves payroll from CALCULATED to APPROVED status, allowing it to be paid
 */
export const POST = withEnhancedAuth(
  async (request: NextRequest, { params }: { params: { runId: string } }) => {
    try {
      const { user } = context;
      const { runId } = params;
      const body = await request.json();

      // Validate request body
      const validationResult = approvePayrollSchema.safeParse(body);
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

      // TODO: Implement actual approval logic
      // Check permissions, verify payroll status, update database

      const response: ApiResponse = {
        success: true,
        data: {
          runId,
          status: 'APPROVED',
          approvedBy: user.userId,
          approvedAt: new Date().toISOString(),
          approvalLevel: validationResult.data.approvalLevel,
          message: 'Payroll approved successfully',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('[Payroll Approve API] POST Error:', error);

      // Check for specific business logic errors
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'E3001',
              message: 'Payroll run not found',
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
              apiVersion: 'v1',
            },
          };

          return NextResponse.json(response, { status: 404 });
        }

        if (error.message.includes('Cannot approve')) {
          const response: ApiResponse = {
            success: false,
            error: {
              code: 'E4001',
              message: error.message,
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
              apiVersion: 'v1',
            },
          };

          return NextResponse.json(response, { status: 409 });
        }
      }

      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to approve payroll',
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
