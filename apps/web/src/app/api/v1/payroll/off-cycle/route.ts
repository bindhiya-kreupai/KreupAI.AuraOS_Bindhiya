export const dynamic = 'force-dynamic';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';
import { z } from 'zod';

const offCycleSchema = z.object({
  companyId: z.string().uuid('Valid company ID is required'),
  reason: z.enum(['bonus', 'commission', 'correction', 'termination', 'other']),
  payDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Pay date must be in YYYY-MM-DD format'),
  employeeIds: z.array(z.string().uuid()).min(1, 'At least one employee ID is required'),
  amounts: z
    .array(
      z.object({
        employeeId: z.string().uuid(),
        amount: z.number().positive('Amount must be positive'),
        description: z.string(),
      })
    )
    .min(1, 'At least one amount entry is required'),
  notes: z.string().optional(),
});

/**
 * POST /api/v1/payroll/off-cycle
 * Create an off-cycle payroll run (bonus, commission, correction, termination, etc.)
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
      const validationResult = offCycleSchema.safeParse(body);
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

      const { companyId, reason, payDate, employeeIds, amounts, notes } = validationResult.data;

      // Find payroll configuration
      const config = await prisma.payrollConfiguration.findUnique({
        where: {
          tenantId_companyId: {
            tenantId,
            companyId,
          },
        },
      });

      if (!config) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E3001',
              message: 'Payroll configuration not found for this company',
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

      // Calculate totals from amounts
      const totalGross = amounts.reduce((sum, a) => sum + a.amount, 0);

      // Use the payDate month as the payroll month for the off-cycle run
      const payrollMonth = payDate.slice(0, 7); // YYYY-MM

      // Create the off-cycle payroll run
      const payrollRun = await prisma.payrollRun.create({
        data: {
          tenantId,
          configId: config.id,
          payrollMonth: `${payrollMonth}-OC-${Date.now()}`, // Make unique by appending off-cycle identifier
          status: 'PROCESSING',
          totalEmployees: employeeIds.length,
          totalGrossSalary: totalGross,
          totalNetSalary: totalGross, // Will be recalculated after processing
          currency: config.countryCode === 'IN' ? 'INR' : 'AED',
          notes: notes || `Off-cycle payroll: ${reason} (pay date: ${payDate})`,
          createdBy: user.userId,
          processedAt: new Date(),
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            runId: payrollRun.id,
            status: 'processing',
            payDate,
            reason,
            employeeCount: employeeIds.length,
            totalGross,
            currency: payrollRun.currency,
            createdAt: payrollRun.createdAt.toISOString(),
            message: `Off-cycle payroll run initiated for ${employeeIds.length} employees.`,
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
      console.error('[Off-Cycle Payroll API] POST Error:', error);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to create off-cycle payroll run',
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
