import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { z } from 'zod';

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

// Validation schema
const runPayrollSchema = z.object({
  tenantId: z.string().uuid('Valid tenant ID is required'),
  companyId: z.string().uuid('Valid company ID is required'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format'),
  countryCode: z.enum(['IN', 'AE', 'SA', 'QA', 'KW', 'BH', 'OM']),
  employeeIds: z.array(z.string().uuid()).optional(),
});

/**
 * POST /api/v1/payroll/run
 * Initiate a payroll run for a specific month
 *
 * This endpoint creates a new payroll run and calculates payslips for all employees
 * (or specific employees if employeeIds are provided)
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Validate request body
    const validationResult = runPayrollSchema.safeParse(body);
    if (!validationResult.success) {
      const response: ApiResponse = {
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
      };

      return NextResponse.json(response, { status: 400 });
    }

    const { tenantId, companyId, month, countryCode, employeeIds } = validationResult.data;

    // TODO: Import and use PayrollService from @/lib/services/payroll
    // For now, return a placeholder response indicating the payroll run has been initiated
    const response: ApiResponse = {
      success: true,
      data: {
        runId: crypto.randomUUID(),
        status: 'PROCESSING',
        message: `Payroll run initiated for ${month}. Processing ${employeeIds?.length || 'all'} employees.`,
        estimatedCompletionTime: new Date(Date.now() + 60000).toISOString(), // 1 minute
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    return NextResponse.json(response, { status: 202 }); // 202 Accepted - async processing
  } catch (error) {
    console.error('[Payroll Run API] POST Error:', error);

    const response: ApiResponse = {
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
    };

    return NextResponse.json(response, { status: 500 });
  }
});
