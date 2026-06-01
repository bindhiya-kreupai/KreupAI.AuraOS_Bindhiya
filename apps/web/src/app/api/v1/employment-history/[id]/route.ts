/**
 * @api /api/v1/employment-history/:id
 * @description Individual employment history record operations
 * @project AURA HCM Platform
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
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
 * GET /api/v1/employment-history/:id
 * Get employment history record by ID
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { id } = context.params;
    const { user, permissions } = context;
    if (!permissions.includes('employment-history:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing employment-history:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }

    const record = await EmploymentHistoryService.findById(id, user.tenantId);

    if (!record) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E3001',
          message: 'Employment history record not found',
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
    console.error('[Employment History API] GET Error:', error);

    const response: ApiResponse = {
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch employment history record',
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

/**
 * PUT /api/v1/employment-history/:id
 * Update employment history record
 */
export const PUT = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { id } = context.params;
      const { user, permissions } = context;
      if (!permissions.includes('employment-history:update')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing employment-history:update permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const body = await request.json();

      const record = await EmploymentHistoryService.update(id, user.tenantId, body);

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
      console.error('[Employment History API] PUT Error:', error);

      let statusCode = 500;
      let errorCode = 'E5001';

      if (error instanceof Error && error.message.includes('not found')) {
        statusCode = 404;
        errorCode = 'E3001';
      }

      const response: ApiResponse = {
        success: false,
        error: {
          code: errorCode,
          message:
            error instanceof Error ? error.message : 'Failed to update employment history record',
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
    resourceType: 'employment_history',
    captureRequestBody: true,
    extractResourceId: (req, ctx) => ctx?.params?.id,
  }
);

/**
 * DELETE /api/v1/employment-history/:id
 * Delete employment history record
 */
export const DELETE = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { id } = context.params;
      const { user, permissions } = context;
      if (!permissions.includes('employment-history:delete')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing employment-history:delete permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }

      await EmploymentHistoryService.delete(id, user.tenantId);

      const response: ApiResponse = {
        success: true,
        data: null,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('[Employment History API] DELETE Error:', error);

      const statusCode = error instanceof Error && error.message.includes('not found') ? 404 : 500;
      const errorCode =
        error instanceof Error && error.message.includes('not found') ? 'E3001' : 'E5001';

      const response: ApiResponse = {
        success: false,
        error: {
          code: errorCode,
          message:
            error instanceof Error ? error.message : 'Failed to delete employment history record',
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
    action: AuditAction.EMPLOYEE_DELETED,
    resourceType: 'employment_history',
    extractResourceId: (req, ctx) => ctx?.params?.id,
  }
);
