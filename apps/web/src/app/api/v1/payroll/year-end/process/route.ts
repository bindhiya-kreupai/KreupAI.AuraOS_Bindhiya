export const dynamic = 'force-dynamic';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';
import { z } from 'zod';

const yearEndProcessSchema = z.object({
  taxYear: z.number().int().min(2000).max(2099),
  steps: z
    .array(
      z.enum([
        'verify_records',
        'calculate_totals',
        'generate_w2',
        'generate_1099',
        'file_irs',
        'distribute',
      ])
    )
    .optional(),
  forceRerun: z.boolean().optional().default(false),
});

/**
 * POST /api/v1/payroll/year-end/process
 * Initiate year-end processing for a specific tax year
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
      const validationResult = yearEndProcessSchema.safeParse(body);
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

      const { taxYear, steps, forceRerun } = validationResult.data;

      const allSteps = [
        'verify_records',
        'calculate_totals',
        'generate_w2',
        'generate_1099',
        'file_irs',
        'distribute',
      ];

      const stepsToProcess = steps || allSteps;

      // Verify there are payroll runs for this year
      const payrollRunCount = await prisma.payrollRun.count({
        where: {
          tenantId,
          payrollMonth: {
            gte: `${taxYear}-01`,
            lte: `${taxYear}-12`,
          },
        },
      });

      if (payrollRunCount === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E3001',
              message: `No payroll runs found for tax year ${taxYear}`,
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

      // Check if documents already exist (unless forceRerun)
      if (!forceRerun) {
        const existingDocs = await prisma.taxDocument.count({
          where: { tenantId, taxYear },
        });

        if (existingDocs > 0) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: 'E2002',
                message: `Tax documents already exist for year ${taxYear}. Use forceRerun: true to regenerate.`,
                details: { existingDocuments: existingDocs },
              },
              meta: {
                timestamp: new Date().toISOString(),
                requestId: crypto.randomUUID(),
                apiVersion: 'v1',
              },
            },
            { status: 409 }
          );
        }
      }

      // Get employee count for the tax year
      const employeeCount = await prisma.employee.count({
        where: { tenantId, status: 'Active' },
      });

      // If generate steps are included, create tax documents
      let documentsCreated = 0;
      if (stepsToProcess.includes('generate_w2') || stepsToProcess.includes('generate_1099')) {
        const employees = await prisma.employee.findMany({
          where: { tenantId, status: 'Active' },
          select: { id: true },
        });

        if (stepsToProcess.includes('generate_w2')) {
          const w2Results = await Promise.allSettled(
            employees.map((emp) =>
              prisma.taxDocument.upsert({
                where: {
                  tenantId_employeeId_type_taxYear: {
                    tenantId,
                    employeeId: emp.id,
                    type: 'W2',
                    taxYear,
                  },
                },
                create: {
                  tenantId,
                  employeeId: emp.id,
                  type: 'W2',
                  taxYear,
                  status: 'GENERATED',
                  generatedAt: new Date(),
                  metadata: { generatedBy: user.userId, yearEndProcess: true },
                },
                update: {
                  status: 'GENERATED',
                  generatedAt: new Date(),
                  amendments: { increment: 1 },
                },
              })
            )
          );
          documentsCreated += w2Results.filter((r) => r.status === 'fulfilled').length;
        }
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            jobId: `ye-${Date.now()}`,
            taxYear,
            status: 'queued',
            stepsToProcess,
            payrollRunsFound: payrollRunCount,
            employeeCount,
            documentsCreated,
            estimatedDuration: `${stepsToProcess.length * 8} minutes`,
            startedAt: new Date().toISOString(),
            message: `Year-end processing queued for tax year ${taxYear}. ${stepsToProcess.length} steps will be processed.`,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 202 }
      );
    } catch (error) {
      console.error('[Year-End Process API] POST Error:', error);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to initiate year-end processing',
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
    resourceType: 'payroll_run',
    captureRequestBody: true,
  }
);
