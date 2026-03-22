import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

/**
 * GET /api/v1/payroll/status/:runId
 * Get real-time status of a payroll run from database
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { runId } = context.params;

    const run = await prisma.payrollRun.findFirst({
      where: { id: runId, tenantId: user.tenantId, isDeleted: false },
      include: { _count: { select: { payslips: true } } },
    });

    if (!run) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E4001', message: 'Payroll run not found' },
          meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        runId: run.id,
        payrollMonth: run.payrollMonth,
        status: run.status,
        totalEmployees: run.totalEmployees,
        processedEmployees: run._count.payslips,
        summary: {
          totalGross: Number(run.totalGrossSalary),
          totalDeductions: Number(run.totalDeductions),
          totalNet: Number(run.totalNetSalary),
          totalEmployerCost: Number(run.totalEmployerCost),
          currency: run.currency,
        },
        processedAt: run.processedAt?.toISOString() || null,
        approvedBy: run.approvedBy,
        approvedAt: run.approvedAt?.toISOString() || null,
        paidAt: run.paidAt?.toISOString() || null,
        notes: run.notes,
        createdAt: run.createdAt.toISOString(),
      },
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    });
  } catch (error) {
    console.error('[Payroll Status API] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'E5001', message: 'Failed to fetch payroll status' },
        meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
      },
      { status: 500 }
    );
  }
});
