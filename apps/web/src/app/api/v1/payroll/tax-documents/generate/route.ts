export const dynamic = 'force-dynamic';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';
import { z } from 'zod';

const generateSchema = z.object({
  taxYear: z.number().int().min(2000).max(2099),
  type: z.enum(['W2', '1099', 'FORM_16']),
  employeeIds: z.array(z.string().uuid()).optional(),
});

/**
 * POST /api/v1/payroll/tax-documents/generate
 * Queue tax document generation for a specific year and type
 */
export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context) => {
    try {
      const { user, permissions } = context;
      if (!permissions.includes('payroll:create')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing payroll:create permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const tenantId = user.tenantId;
      const body = await request.json();

      // Validate request body
      const validationResult = generateSchema.safeParse(body);
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

      const { taxYear, type, employeeIds } = validationResult.data;

      // Get employees to generate documents for
      const employeeWhere: Record<string, unknown> = { tenantId, status: 'Active' };
      if (employeeIds && employeeIds.length > 0) {
        employeeWhere.id = { in: employeeIds };
      }

      const employees = await prisma.employee.findMany({
        where: employeeWhere,
        select: { id: true, firstName: true, lastName: true },
      });

      if (employees.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E3001',
              message: 'No eligible employees found',
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
              apiVersion: 'v1',
            },
          },
          { status: 404 }
        );
      }

      // Create tax document records for each employee (upsert to handle reruns)
      const results = await Promise.allSettled(
        employees.map((emp) =>
          prisma.taxDocument.upsert({
            where: {
              tenantId_employeeId_type_taxYear: {
                tenantId,
                employeeId: emp.id,
                type,
                taxYear,
              },
            },
            create: {
              tenantId,
              employeeId: emp.id,
              type,
              taxYear,
              status: 'GENERATED',
              generatedAt: new Date(),
              metadata: { generatedBy: user.userId, batchGeneration: true },
            },
            update: {
              status: 'GENERATED',
              generatedAt: new Date(),
              amendments: { increment: 1 },
              metadata: { regeneratedBy: user.userId, regeneratedAt: new Date().toISOString() },
            },
          })
        )
      );

      const successCount = results.filter((r) => r.status === 'fulfilled').length;
      const failedCount = results.filter((r) => r.status === 'rejected').length;

      return NextResponse.json(
        {
          success: true,
          data: {
            jobId: `taxgen-${Date.now()}`,
            status: 'queued',
            type,
            taxYear,
            totalDocuments: employees.length,
            successCount,
            failedCount,
            estimatedCompletionTime: new Date(Date.now() + 300000).toISOString(),
            message: `Tax document generation completed for ${successCount} ${type} forms.${failedCount > 0 ? ` ${failedCount} failed.` : ''}`,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 202 }
      );
    } catch (error: any) {
      console.error('[Tax Documents Generate API] POST Error:', error);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to generate tax documents',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.PAYROLL_RUN_INITIATED,
    resourceType: 'tax_document',
    captureRequestBody: true,
  }
);
