/**
 * Data Export API
 * POST /api/v1/export - Request data export
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { ExportFormat, ExportEntity } from '@/lib/export/export.service';
import { exportService } from '@/lib/export/export.service';
import { logger } from '@/lib/logger';
import { withAuth } from '@/lib/auth';
import { auditMiddleware } from '@/lib/middleware/audit.middleware';

/**
 * Validation schema for export request
 */
const exportRequestSchema = z.object({
  entity: z.enum(['EMPLOYEES', 'ATTENDANCE', 'LEAVE', 'PAYROLL', 'DEPARTMENTS', 'POSITIONS']),
  format: z.enum(['CSV', 'EXCEL', 'JSON', 'PDF']),
  filters: z
    .object({
      companyId: z.string().uuid(),
      tenantId: z.string().uuid(),
      departmentId: z.string().uuid().optional(),
      startDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
      endDate: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
      employeeIds: z.array(z.string().uuid()).optional(),
      status: z.string().optional(),
    })
    .optional(),
  columns: z.array(z.string()).optional(),
});

/**
 * POST /api/v1/export
 * Request data export (async)
 */
async function handlePOST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate request
    const validation = exportRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'Validation failed',
            details: validation.error.errors,
          },
        },
        { status: 400 }
      );
    }

    const { entity, format, filters, columns } = validation.data;

    // Get user info from auth middleware
    const user = (request as any).user || {
      id: 'system',
      email: 'system@auraos.com',
    };

    logger.info(
      {
        userId: user.id,
        entity,
        format,
        filters,
      },
      'Export request received'
    );

    // Request export (async)
    const exportId = await exportService.requestExport({
      entity: entity as ExportEntity,
      format: format as ExportFormat,
      filters: filters as any,
      columns,
      userId: user.id,
      userEmail: user.email,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          exportId,
          status: 'PENDING',
          message:
            'Export request submitted. You will receive a notification when the export is ready.',
        },
        meta: {
          timestamp: new Date().toISOString(),
          apiVersion: 'v1',
        },
      },
      { status: 202 } // Accepted
    );
  } catch (error) {
    logger.error({ error }, 'Export request failed');

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to process export request',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
        meta: {
          timestamp: new Date().toISOString(),
          apiVersion: 'v1',
        },
      },
      { status: 500 }
    );
  }
}

// Export with auth and audit middleware
export const POST = auditMiddleware.exportData(withAuth(handlePOST));
