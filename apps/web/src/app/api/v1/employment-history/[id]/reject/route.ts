/**
 * @api /api/v1/employment-history/:id/reject
 * @description Reject employment history change
 * @project AURA HCM Platform
 */

import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { EmploymentHistoryService } from '@/lib/services/employment-history.service';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';

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
 * POST /api/v1/employment-history/:id/reject
 * Reject pending employment history change
 */
export const POST = withAudit(withEnhancedAuth(
  async (request: NextRequest, context: any) => {
    try {
      const { id } = context.params;
      const { user } = context;
      const body = await request.json();

      const record = await EmploymentHistoryService.reject(
        id,
        user.tenantId,
        user.userId,
        body.reason
      );

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
    } catch (error) {
      console.error('[Employment History Reject API] POST Error:', error);

      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      const errorCode = error instanceof Error && error.message.includes('not found') ? 'E3001' : 'E5001';

      const response: ApiResponse = {
        success: false,
        error: {
          code: errorCode,
          message: error instanceof Error ? error.message : 'Failed to reject employment history change',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: statusCode });
    }
  }
), {
  action: AuditAction.EMPLOYEE_UPDATED,
  resourceType: 'employment_history',
  captureRequestBody: true,
  extractResourceId: (req, ctx) => ctx?.params?.id,
});
