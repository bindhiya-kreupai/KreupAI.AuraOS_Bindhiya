import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Generate payroll reports and analytics
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const { searchParams } = new URL(request.url);
      const reportType = searchParams.get('type');
      const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);

      // Fetch base data for reports
      const currentRun = await prisma.payrollRun.findFirst({
        where: { tenantId, payrollMonth: month },
        orderBy: { createdAt: 'desc' },
        include: { payslips: true },
      });

      // Find previous month run for variance
      const [year, mon] = month.split('-').map(Number);
      const prevMonth = mon === 1
        ? `${year - 1}-12`
        : `${year}-${String(mon - 1).padStart(2, '0')}`;

      const prevRun = await prisma.payrollRun.findFirst({
        where: { tenantId, payrollMonth: prevMonth },
        orderBy: { createdAt: 'desc' },
      });

      // Build salary register report from payslips
      const salaryRegister = {
        name: 'Salary Register',
        description: 'Detailed monthly salary breakdown per employee',
        data: {
          month,
          employees: currentRun?.payslips.map((ps) => ({
            id: ps.employeeId,
            employeeCode: ps.employeeCode,
            name: ps.employeeName,
            basicSalary: Number(ps.basicSalary || 0),
            totalEarnings: Number(ps.totalEarnings || 0),
            totalDeductions: Number(ps.totalDeductions || 0),
            netPay: Number(ps.totalEarnings || 0) - Number(ps.totalDeductions || 0),
            employeePF: Number(ps.employeePF || 0),
            employeeESI: Number(ps.employeeESI || 0),
            employeeTDS: Number(ps.employeeTDS || 0),
            workingDays: ps.workingDays,
            paidDays: ps.paidDays,
            lopDays: ps.lopDays,
          })) || [],
          totals: {
            basicSalary: currentRun?.payslips.reduce((s, p) => s + Number(p.basicSalary || 0), 0) || 0,
            totalEarnings: Number(currentRun?.totalGrossSalary || 0),
            totalDeductions: Number(currentRun?.totalDeductions || 0),
            netPay: Number(currentRun?.totalNetSalary || 0),
          },
        },
      };

      // Tax liability report
      const taxDeclarations = await prisma.taxDeclaration.findMany({
        where: { tenantId },
        orderBy: { financialYear: 'desc' },
      });

      const taxLiability = {
        name: 'Tax Liability Report',
        description: 'Summary of TDS deducted and liable payments',
        data: {
          month,
          totalTDSDeducted: currentRun?.payslips.reduce(
            (s, p) => s + Number(p.employeeTDS || 0),
            0
          ) || 0,
          totalEmployees: currentRun?.payslips.length || 0,
          declarations: taxDeclarations.length,
          regimeBreakdown: {
            old: taxDeclarations.filter((d) => d.taxRegime === 'OLD').length,
            new: taxDeclarations.filter((d) => d.taxRegime === 'NEW').length,
          },
        },
      };

      // Variance report
      const currentTotal = Number(currentRun?.totalNetSalary || 0);
      const previousTotal = Number(prevRun?.totalNetSalary || 0);
      const variance = currentTotal - previousTotal;

      const varianceReport = {
        name: 'Variance Report',
        description: 'Month-on-month comparison of payroll costs',
        data: {
          currentMonth: month,
          previousMonth: prevMonth,
          currentTotal,
          previousTotal,
          variance,
          variancePercent: previousTotal > 0 ? (variance / previousTotal) * 100 : 0,
          currentGross: Number(currentRun?.totalGrossSalary || 0),
          previousGross: Number(prevRun?.totalGrossSalary || 0),
          currentEmployees: currentRun?.totalEmployees || 0,
          previousEmployees: prevRun?.totalEmployees || 0,
        },
      };

      // Cost center / employer cost report
      const costCenter = {
        name: 'Cost Center Distribution',
        description: 'Payroll cost allocation summary',
        data: {
          month,
          totalCost: Number(currentRun?.totalEmployerCost || 0),
          totalGross: Number(currentRun?.totalGrossSalary || 0),
          totalNet: Number(currentRun?.totalNetSalary || 0),
          totalDeductions: Number(currentRun?.totalDeductions || 0),
          employeeCount: currentRun?.totalEmployees || 0,
          averageSalary: currentRun && (currentRun.totalEmployees || 0) > 0
            ? Number(currentRun.totalNetSalary || 0) / (currentRun.totalEmployees || 1)
            : 0,
        },
      };

      // Payroll trend (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const trendStartMonth = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}`;

      const recentRuns = await prisma.payrollRun.findMany({
        where: {
          tenantId,
          payrollMonth: { gte: trendStartMonth },
        },
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

      // Stats summary for analytics dashboard
      const stats = {
        totalEmployees: currentRun?.totalEmployees || 0,
        activePayrolls: await prisma.payrollRun.count({
          where: { tenantId, status: { in: ['DRAFT', 'PROCESSING', 'CALCULATED', 'PENDING_APPROVAL'] } },
        }),
        monthlyPayrollCost: Number(currentRun?.totalEmployerCost || currentRun?.totalNetSalary || 0),
        averageSalary: currentRun && (currentRun.totalEmployees || 0) > 0
          ? Number(currentRun.totalNetSalary || 0) / (currentRun.totalEmployees || 1)
          : 0,
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
        payrollTrend,
      };

      const reports: Record<string, unknown> = {
        'salary-register': salaryRegister,
        'tax-liability': taxLiability,
        variance: varianceReport,
        'cost-center': costCenter,
      };

      const report = reportType ? reports[reportType] : null;

      if (!report && reportType && reportType !== 'stats') {
        return NextResponse.json(
          { success: false, error: 'Invalid report type' },
          { status: 400 }
        );
      }

      // Handle stats request
      if (reportType === 'stats') {
        return NextResponse.json({
          success: true,
          stats,
          data: stats,
        });
      }

      return NextResponse.json({
        success: true,
        data: reportType ? report : reports,
        stats,
        meta: { month },
      });
    } catch (error) {
      logger.error('Error generating report:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to generate report' },
        { status: 500 }
      );
    }
  }
);
