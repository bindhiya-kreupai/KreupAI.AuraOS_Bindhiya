import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { ShiftManagementService } from '@/lib/services/shift-management.service';
import { z } from 'zod';

const publishSchema = z.object({
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dateFrom must be YYYY-MM-DD'),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dateTo must be YYYY-MM-DD'),
});

export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, permissions } = context;
      if (!permissions.includes('shifts:create')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing shifts:create permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }

      const body = await request.json();
      const validationResult = publishSchema.safeParse(body);
      if (!validationResult.success) {
        return NextResponse.json(
          {
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
          },
          { status: 400 }
        );
      }

      const { dateFrom, dateTo } = validationResult.data;
      const result = await ShiftManagementService.publishRoster(
        user.tenantId,
        dateFrom,
        dateTo,
        user.userId
      );

      return NextResponse.json(
        {
          success: true,
          data: {
            message:
              result.count > 0
                ? `Published ${result.count} roster entries for ${result.employeeIds.length} employees`
                : 'No draft roster entries found in the specified date range',
            publishedCount: result.count,
            employeeCount: result.employeeIds.length,
            dateFrom,
            dateTo,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 200 }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E5001', message: error.message || 'Failed to publish roster' },
        },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.SHIFT_ROSTER_PUBLISHED,
    resourceType: 'shift_roster',
    captureRequestBody: true,
  }
);
