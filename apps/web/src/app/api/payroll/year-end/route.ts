import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch year-end processing status and summary
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
    if (permissionError) return permissionError;

    const tenantId = user.tenantId;
    const { searchParams } = new URL(request.url);
    const fiscalYear = searchParams.get('fiscalYear') || new Date().getFullYear().toString();

    // Determine fiscal year month range (April-March for India, Jan-Dec otherwise)
    const fyStart = `${fiscalYear}-01`;
    const fyEnd = `${fiscalYear}-12`;

    // Fetch all payroll runs in the fiscal year
    const payrollRuns = await prisma.payrollRun.findMany({
      where: {
        tenantId,
        payrollMonth: { gte: fyStart, lte: fyEnd },
      },
      include: {
        _count: { select: { payslips: true } },
      },
      orderBy: { payrollMonth: 'asc' },
    });

    // Fetch tax declarations for the fiscal year
    const taxDeclarations = await prisma.taxDeclaration.findMany({
      where: { tenantId, financialYear: fiscalYear },
    });

    // Fetch statutory payments for the fiscal year
    const statutoryPayments = await prisma.statutoryPayment.findMany({
      where: {
        tenantId,
        paymentMonth: { gte: fyStart, lte: fyEnd },
      },
    });

    // Calculate year totals
    const yearTotals = {
      totalGross: payrollRuns.reduce((s, r) => s + Number(r.totalGrossSalary || 0), 0),
      totalDeductions: payrollRuns.reduce((s, r) => s + Number(r.totalDeductions || 0), 0),
      totalNet: payrollRuns.reduce((s, r) => s + Number(r.totalNetSalary || 0), 0),
      totalEmployerCost: payrollRuns.reduce((s, r) => s + Number(r.totalEmployerCost || 0), 0),
      totalMonthsProcessed: payrollRuns.length,
    };

    // Generate checklist based on actual data
    const maxEmployees = Math.max(...payrollRuns.map((r) => r.totalEmployees || 0), 0);
    const paidRuns = payrollRuns.filter((r) => r.status === 'PAID').length;
    const verifiedDeclarations = taxDeclarations.filter(
      (d) => d.status === 'VERIFIED' || d.status === 'APPROVED'
    ).length;
    const paidStatutory = statutoryPayments.filter((p) => p.isPaid).length;

    const checklist = [
      {
        id: '1',
        task: 'Process all monthly payrolls',
        status: paidRuns >= 12 ? 'COMPLETED' : paidRuns > 0 ? 'IN_PROGRESS' : 'PENDING',
        progress: `${paidRuns}/12 months`,
        completedAt:
          paidRuns >= 12 ? payrollRuns[payrollRuns.length - 1]?.processedAt?.toISOString() : null,
      },
      {
        id: '2',
        task: 'Verify all tax declarations',
        status:
          taxDeclarations.length > 0 && verifiedDeclarations === taxDeclarations.length
            ? 'COMPLETED'
            : verifiedDeclarations > 0
              ? 'IN_PROGRESS'
              : 'PENDING',
        progress: `${verifiedDeclarations}/${taxDeclarations.length} verified`,
        completedAt: null,
      },
      {
        id: '3',
        task: 'File all statutory returns',
        status:
          statutoryPayments.length > 0 && paidStatutory === statutoryPayments.length
            ? 'COMPLETED'
            : paidStatutory > 0
              ? 'IN_PROGRESS'
              : 'PENDING',
        progress: `${paidStatutory}/${statutoryPayments.length} filed`,
        completedAt: null,
      },
      {
        id: '4',
        task: 'Generate annual statements',
        status: 'PENDING',
        progress: '0/0',
        completedAt: null,
      },
    ];

    const completedTasks = checklist.filter((c) => c.status === 'COMPLETED').length;
    const overallStatus =
      completedTasks === checklist.length
        ? 'COMPLETED'
        : completedTasks > 0
          ? 'IN_PROGRESS'
          : 'NOT_STARTED';

    const yearEndData = {
      fiscalYear,
      status: overallStatus,
      checklist,
      summary: {
        totalEmployees: maxEmployees,
        totalPayrollRuns: payrollRuns.length,
        taxDeclarationsCount: taxDeclarations.length,
        verifiedDeclarations,
        statutoryPaymentsCount: statutoryPayments.length,
        paidStatutory,
        ...yearTotals,
      },
      monthlyBreakdown: payrollRuns.map((r) => ({
        month: r.payrollMonth,
        status: r.status,
        employees: r.totalEmployees,
        gross: Number(r.totalGrossSalary || 0),
        net: Number(r.totalNetSalary || 0),
        deductions: Number(r.totalDeductions || 0),
      })),
    };

    return NextResponse.json({
      success: true,
      data: yearEndData,
    });
  } catch (error: any) {
    logger.error('Error fetching year-end data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch year-end data' },
      { status: 500 }
    );
  }
});

// POST - Process year-end task
export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    const tenantId = user.tenantId;
    const body = await request.json();
    const { fiscalYear, taskId } = body;

    if (!fiscalYear || !taskId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: fiscalYear, taskId' },
        { status: 400 }
      );
    }

    // Handle specific year-end tasks
    let taskResult: Record<string, unknown> = {};

    switch (taskId) {
      case '1': {
        // Check payroll processing status
        const runs = await prisma.payrollRun.count({
          where: { tenantId, payrollMonth: { startsWith: fiscalYear }, status: 'PAID' },
        });
        taskResult = { monthsProcessed: runs, complete: runs >= 12 };
        break;
      }
      case '2': {
        // Verify tax declarations
        const declarations = await prisma.taxDeclaration.findMany({
          where: { tenantId, financialYear: fiscalYear, status: { in: ['SUBMITTED'] } },
        });
        // Auto-verify submitted declarations
        if (declarations.length > 0) {
          await prisma.taxDeclaration.updateMany({
            where: {
              id: { in: declarations.map((d) => d.id) },
            },
            data: {
              status: 'VERIFIED',
              verifiedBy: user.userId,
              verifiedAt: new Date(),
            },
          });
        }
        taskResult = { verified: declarations.length };
        break;
      }
      case '3': {
        // Check statutory filing status
        const pending = await prisma.statutoryPayment.count({
          where: { tenantId, paymentMonth: { startsWith: fiscalYear }, status: 'PENDING' },
        });
        taskResult = { pendingPayments: pending };
        break;
      }
      default:
        taskResult = { message: 'Task noted' };
    }

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.userId,
        action: 'CREATE',
        module: 'Payroll - Year-End Processing',
        resourceType: 'Payroll - Year-End Processing',
        metadata: { description: `Processed year-end task: ${taskId} for FY ${fiscalYear}` } as any,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    const result = {
      taskId,
      fiscalYear,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      processedBy: user.userId,
      ...taskResult,
    };

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    logger.error('Error processing year-end task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process year-end task' },
      { status: 500 }
    );
  }
});
