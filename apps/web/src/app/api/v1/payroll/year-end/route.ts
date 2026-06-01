export const dynamic = 'force-dynamic';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

/**
 * GET /api/v1/payroll/year-end
 * Get year-end processing status computed from PayrollRun + TaxDocument data
 *
 * Query Parameters:
 * - taxYear (optional): Tax year to query (default: previous year)
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('payroll:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing payroll:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const tenantId = user.tenantId;
    const { searchParams } = new URL(request.url);
    const taxYear = parseInt(searchParams.get('taxYear') || String(new Date().getFullYear() - 1));

    // Get all payroll runs for the year
    const payrollRuns = await prisma.payrollRun.findMany({
      where: {
        tenantId,
        payrollMonth: {
          gte: `${taxYear}-01`,
          lte: `${taxYear}-12`,
        },
      },
      select: {
        id: true,
        status: true,
        payrollMonth: true,
        totalEmployees: true,
      },
    });

    // Get all tax documents for this year
    const taxDocuments = await prisma.taxDocument.findMany({
      where: {
        tenantId,
        taxYear,
      },
      select: {
        id: true,
        type: true,
        status: true,
        generatedAt: true,
        deliveredAt: true,
      },
    });

    // Count distinct employees from payroll runs
    const totalEmployees =
      payrollRuns.length > 0 ? Math.max(...payrollRuns.map((r) => r.totalEmployees)) : 0;

    // Compute W2 and 1099 stats
    const w2Docs = taxDocuments.filter((d) => d.type === 'W2');
    const form1099Docs = taxDocuments.filter((d) => d.type === '1099');
    const w2Generated = w2Docs.length;
    const w2Delivered = w2Docs.filter((d) => d.status === 'DELIVERED').length;
    const form1099Generated = form1099Docs.length;
    const form1099Delivered = form1099Docs.filter((d) => d.status === 'DELIVERED').length;

    // Determine processing steps based on actual data
    const allMonthsProcessed =
      payrollRuns.length >= 12 &&
      payrollRuns.every((r) => ['PAID', 'APPROVED', 'CALCULATED'].includes(r.status));

    const steps = [
      {
        name: 'Verify employee records',
        status: allMonthsProcessed
          ? ('completed' as const)
          : payrollRuns.length > 0
            ? ('in_progress' as const)
            : ('pending' as const),
        completedAt: allMonthsProcessed ? new Date().toISOString() : null,
        errorMessage: null,
      },
      {
        name: 'Calculate annual totals',
        status: allMonthsProcessed ? ('completed' as const) : ('pending' as const),
        completedAt: allMonthsProcessed ? new Date().toISOString() : null,
        errorMessage: null,
      },
      {
        name: 'Generate W2 forms',
        status:
          w2Generated >= totalEmployees && totalEmployees > 0
            ? ('completed' as const)
            : w2Generated > 0
              ? ('in_progress' as const)
              : ('pending' as const),
        completedAt:
          w2Generated >= totalEmployees && totalEmployees > 0 ? new Date().toISOString() : null,
        errorMessage: null,
      },
      {
        name: 'Generate 1099 forms',
        status: form1099Generated > 0 ? ('completed' as const) : ('pending' as const),
        completedAt: form1099Generated > 0 ? new Date().toISOString() : null,
        errorMessage: null,
      },
      {
        name: 'File with IRS',
        status: 'pending' as const,
        completedAt: null,
        errorMessage: null,
      },
      {
        name: 'Distribute to employees',
        status:
          w2Delivered > 0 || form1099Delivered > 0
            ? w2Delivered >= w2Generated && form1099Delivered >= form1099Generated
              ? ('completed' as const)
              : ('in_progress' as const)
            : ('pending' as const),
        completedAt:
          w2Delivered >= w2Generated &&
          form1099Delivered >= form1099Generated &&
          w2Generated + form1099Generated > 0
            ? new Date().toISOString()
            : null,
        errorMessage: null,
      },
    ];

    // Determine overall status
    const completedSteps = steps.filter((s) => s.status === 'completed').length;
    const inProgressSteps = steps.filter((s) => s.status === 'in_progress').length;
    let overallStatus: 'not_started' | 'in_progress' | 'review' | 'completed';
    if (completedSteps === steps.length) {
      overallStatus = 'completed';
    } else if (completedSteps >= steps.length - 1) {
      overallStatus = 'review';
    } else if (completedSteps > 0 || inProgressSteps > 0) {
      overallStatus = 'in_progress';
    } else {
      overallStatus = 'not_started';
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          taxYear,
          status: overallStatus,
          steps,
          w2Generated,
          w2Total: totalEmployees,
          form1099Generated,
          form1099Total: form1099Docs.length > 0 ? form1099Docs.length : 0,
          lastUpdated: new Date().toISOString(),
          estimatedCompletion:
            overallStatus === 'completed'
              ? null
              : new Date(new Date().getFullYear(), 0, 31).toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Year-End API] GET Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch year-end status',
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
});
