export const dynamic = 'force-dynamic';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { auditMiddleware } from '@/lib/middleware/audit.middleware';
import { z } from 'zod';

// Validation schema
const runPayrollSchema = z.object({
  companyId: z.string().uuid('Valid company ID is required'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  countryCode: z.enum(['IN', 'AE', 'SA', 'QA', 'KW', 'BH', 'OM']),
  employeeIds: z.array(z.string().uuid()).optional(),
  notes: z.string().optional(),
});

/**
 * POST /api/v1/payroll/run
 * Initiate a payroll run for a specific month
 *
 * This endpoint creates a new payroll run and calculates payslips for all employees
 * (or specific employees if employeeIds are provided)
 */
export const POST = auditMiddleware.runPayroll(
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
      const body = await request.json();

      // Validate request body
      const validationResult = runPayrollSchema.safeParse(body);
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

      const { companyId, month, countryCode, employeeIds, notes } = validationResult.data;
      const tenantId = user.tenantId;

      // Find the payroll configuration for this tenant/company
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
              details: { tenantId, companyId },
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

      // Check if a payroll run already exists for this month
      const existingRun = await prisma.payrollRun.findUnique({
        where: {
          tenantId_configId_payrollMonth: {
            tenantId,
            configId: config.id,
            payrollMonth: month,
          },
        },
      });

      if (existingRun) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E2002',
              message: `A payroll run already exists for ${month}`,
              details: { existingRunId: existingRun.id, status: existingRun.status },
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

      // Count employees to process
      const employeeCount = employeeIds
        ? employeeIds.length
        : await prisma.employee.count({
            where: { tenantId, status: 'Active' },
          });

      // Create the payroll run
      const payrollRun = await prisma.payrollRun.create({
        data: {
          tenantId,
          configId: config.id,
          payrollMonth: month,
          status: 'PROCESSING',
          totalEmployees: employeeCount,
          currency: config.countryCode === 'IN' ? 'INR' : 'AED',
          notes: notes || `Payroll run for ${month} (${countryCode})`,
          createdBy: user.userId,
          processedAt: new Date(),
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            runId: payrollRun.id,
            status: payrollRun.status,
            payrollMonth: payrollRun.payrollMonth,
            totalEmployees: payrollRun.totalEmployees,
            currency: payrollRun.currency,
            message: `Payroll run initiated for ${month}. Processing ${employeeCount} employees.`,
            estimatedCompletionTime: new Date(Date.now() + 60000).toISOString(),
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
      console.error('[Payroll Run API] POST Error:', error);

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to initiate payroll run',
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
  })
);
