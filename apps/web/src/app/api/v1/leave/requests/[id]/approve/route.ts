import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { LeaveService } from '@/lib/services/leave.service';
import { auditMiddleware } from '@/lib/middleware/audit.middleware';

/**
 * PUT /api/v1/leave/requests/:id/approve
 * Approve a leave request (legacy endpoint — delegates to LeaveService)
 */
export const PUT = auditMiddleware.approveLeaveRequest(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, params, permissions } = context;
      if (!permissions.includes('leave:update')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing leave:update permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }

      const leaveRequest = await LeaveService.approveRequest(params.id, user.tenantId, user.id);

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
      const status = error.message?.includes('not found')
        ? 404
        : error.message?.includes('already processed')
          ? 409
          : 400;

      return NextResponse.json(
        {
          success: false,
          error: {
            code: status === 404 ? 'E3001' : 'E5001',
            message: error.message || 'Failed to approve leave request',
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
