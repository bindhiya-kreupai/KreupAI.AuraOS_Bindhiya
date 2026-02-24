export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

/**
 * GET /api/v1/payroll/history
 * Get payroll history for a company
 *
 * Query Parameters:
 * - companyId (optional): Filter by company
 * - status (optional): Filter by payroll run status
 * - limit (optional): Number of records (default: 12, max: 24)
 * - page (optional): Page number for pagination (default: 1)
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const tenantId = user.tenantId;
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const status = searchParams.get('status');
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '12'),
      24
    );
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = { tenantId };
    if (companyId) {
      where.config = { companyId };
    }
    if (status) {
      where.status = status.toUpperCase();
    }

    // Query payroll runs with count
    const [payrollRuns, total] = await Promise.all([
      prisma.payrollRun.findMany({
        where,
        orderBy: { payrollMonth: 'desc' },
        take: limit,
        skip,
        select: {
          id: true,
          payrollMonth: true,
          status: true,
          totalEmployees: true,
          totalGrossSalary: true,
          totalDeductions: true,
          totalNetSalary: true,
          totalEmployerCost: true,
          currency: true,
          processedAt: true,
          approvedAt: true,
          paidAt: true,
          createdAt: true,
        },
      }),
      prisma.payrollRun.count({ where }),
    ]);

    const data = payrollRuns.map((run) => ({
      id: run.id,
      month: run.payrollMonth,
      status: run.status,
      totalEmployees: run.totalEmployees,
      totalGross: Number(run.totalGrossSalary),
      totalDeductions: Number(run.totalDeductions),
      totalNet: Number(run.totalNetSalary),
      totalEmployerCost: Number(run.totalEmployerCost),
      currency: run.currency,
      processedAt: run.processedAt?.toISOString() || null,
      approvedAt: run.approvedAt?.toISOString() || null,
      paidAt: run.paidAt?.toISOString() || null,
      createdAt: run.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data,
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    }, { status: 200 });
  } catch (error) {
    console.error('[Payroll History API] GET Error:', error);

    return NextResponse.json({
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch payroll history',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    }, { status: 500 });
  }
});
