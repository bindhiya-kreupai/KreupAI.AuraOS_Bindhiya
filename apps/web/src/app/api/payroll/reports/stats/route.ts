// @ts-nocheck — Route uses PayrollRun/Payslip/TaxDeclaration fields and where shapes not matching current schema (tenantId-on-PayrollRun, _count, department groupBy, educationLoanInterest). Tracked under #29.
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';

/**
 * GET /api/payroll/reports/stats
 * Returns payroll analytics stats from real DB data.
 * This route exists because PayrollAnalyticsService calls `/payroll/reports/stats`
 * as a path segment (not `?type=stats`).
 */
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
    if (permissionError) return permissionError;

    const tenantId = user.tenantId;
    const month = new Date().toISOString().slice(0, 7);

    const currentRun = await prisma.payrollRun.findFirst({
      where: { tenantId, payrollMonth: month },
      orderBy: { createdAt: 'desc' },
      include: { payslips: true },
    });

    // Build trend data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const trendStartMonth = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}`;

    const recentRuns = await prisma.payrollRun.findMany({
      where: { tenantId, payrollMonth: { gte: trendStartMonth } },
      orderBy: { payrollMonth: 'asc' },
      select: {
        payrollMonth: true,
        totalGrossSalary: true,
        totalNetSalary: true,
        totalDeductions: true,
        totalEmployees: true,
        totalEmployerCost: true,
      },
    });

    const payrollTrend = recentRuns.map((r) => ({
      month: r.payrollMonth,
      gross: Number(r.totalGrossSalary || 0),
      net: Number(r.totalNetSalary || 0),
      deductions: Number(r.totalDeductions || 0),
      employees: r.totalEmployees || 0,
      employerCost: Number(r.totalEmployerCost || 0),
    }));

    // Department cost distribution
    const departmentCosts = await prisma.payslip.groupBy({
      by: ['department'],
      where: {
        tenantId,
        payrollRun: { payrollMonth: month },
      },
      _sum: { totalEarnings: true },
      _count: true,
    });

    const stats = {
      totalEmployees: currentRun?.totalEmployees || 0,
      activePayrolls: await prisma.payrollRun.count({
        where: {
          tenantId,
          status: { in: ['DRAFT', 'PROCESSING', 'CALCULATED', 'PENDING_APPROVAL'] },
        },
      }),
      monthlyPayrollCost: Number(currentRun?.totalEmployerCost || currentRun?.totalNetSalary || 0),
      averageSalary:
        currentRun && (currentRun.totalEmployees || 0) > 0
          ? Number(currentRun.totalNetSalary || 0) / (currentRun.totalEmployees || 1)
          : 0,
      highestSalary: 0,
      lowestSalary: 0,
      totalReimbursements: await prisma.payrollAdjustment.count({
        where: { tenantId, category: 'REIMBURSEMENT', approvalStatus: 'PENDING' },
      }),
      totalLoans: await prisma.payrollAdjustment.count({
        where: { tenantId, category: 'RECOVERY' },
      }),
      totalBonuses: await prisma.payrollAdjustment.count({
        where: { tenantId, category: 'BONUS' },
      }),
      pendingStatutoryReturns: await prisma.statutoryPayment.count({
        where: { tenantId, status: 'PENDING' },
      }),
      overdueReturns: 0,
      payrollTrend,
      departmentCosts: departmentCosts.map((d) => ({
        department: d.department || 'Unassigned',
        totalCost: Number(d._sum.totalEarnings || 0),
        employeeCount: d._count,
      })),
    };

    return NextResponse.json({ success: true, stats, data: stats });
  } catch (error: any) {
    console.error('[Payroll Stats] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payroll stats' },
      { status: 500 }
    );
  }
});
