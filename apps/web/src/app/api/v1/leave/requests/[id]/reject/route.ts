import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { LeaveService } from '@/lib/services/leave.service';
import { auditMiddleware } from '@/lib/middleware/audit.middleware';

/**
 * PUT /api/v1/leave/requests/:id/reject
 * Reject a leave request (legacy endpoint — delegates to LeaveService)
 */
export const PUT = auditMiddleware.rejectLeaveRequest(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, params } = context;
      const body = await request.json();

      const { reason } = body;
      if (!reason || reason.length < 10) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E2001',
              message: 'Rejection reason is required (minimum 10 characters)',
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
              apiVersion: 'v1',
            },
          },
          { status: 400 }
        );
      }

      const leaveRequest = await LeaveService.rejectRequest(
        params.id,
        user.tenantId,
        user.id,
        reason
      );

      return NextResponse.json({
        success: true,
        data: leaveRequest,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      });
    } catch (error: any) {
      const status = error.message?.includes('not found') ? 404
        : error.message?.includes('already processed') ? 409
        : 400;

      return NextResponse.json(
        {
          success: false,
          error: {
            code: status === 404 ? 'E3001' : 'E5001',
            message: error.message || 'Failed to reject leave request',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status }
      );
    }
  })
);
