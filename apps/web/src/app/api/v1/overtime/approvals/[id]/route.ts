import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { OvertimeService } from '@/lib/services/overtime.service';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

const VALID_DECISIONS = ['APPROVED', 'DENIED', 'CONDITIONAL'];

export const PUT = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, params, permissions } = context;
      if (!permissions.includes('overtime:update')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing overtime:update permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const { id } = params;
      const body = await request.json();
      const { decision, notes } = body;

      if (!decision) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E2001',
            message: 'Validation failed: decision is required',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };
        return NextResponse.json(response, { status: 400 });
      }

      if (!VALID_DECISIONS.includes(decision)) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E2001',
            message: `Invalid decision. Must be one of: ${VALID_DECISIONS.join(', ')}`,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };
        return NextResponse.json(response, { status: 400 });
      }

      if (decision === 'DENIED' && !notes) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E2001',
            message: 'Validation failed: notes (denial reason) is required when decision is DENIED',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };
        return NextResponse.json(response, { status: 400 });
      }

      let record;
      if (decision === 'APPROVED' || decision === 'CONDITIONAL') {
        record = await OvertimeService.approve(id, user.tenantId, user.userId);
      } else {
        record = await OvertimeService.reject(id, user.tenantId, user.userId, notes);
      }

      const response: ApiResponse = {
        success: true,
        data: record,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error: any) {
      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      const errorCode = statusCode === 404 ? 'E4001' : 'E5001';

      const response: ApiResponse = {
        success: false,
        error: {
          code: errorCode,
          message: error instanceof Error ? error.message : 'Failed to update OT approval request',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: statusCode });
    }
  }),
  {
    action: AuditAction.EMPLOYEE_UPDATED,
    resourceType: 'overtime_request',
    captureRequestBody: true,
    extractResourceId: (req, ctx) => ctx?.params?.id,
  }
);
