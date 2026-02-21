import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET - Fetch payroll reconciliation data
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const { searchParams } = new URL(request.url);
      const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);

      // Find the payroll run for this month
      const payrollRun = await prisma.payrollRun.findFirst({
        where: { tenantId, payrollMonth: month },
        orderBy: { createdAt: 'desc' },
        include: {
          payslips: true,
        },
      });

      if (!payrollRun) {
        return NextResponse.json({
          success: true,
          data: {
            month,
            summary: {
              totalEmployees: 0,
              processedPayroll: 0,
              actualDisbursed: 0,
              variance: 0,
              variancePercentage: 0,
            },
            discrepancies: [],
            byCategory: {},
          },
        });
      }

      // Get statutory payments for the same month
      const statutoryPayments = await prisma.statutoryPayment.findMany({
        where: { tenantId, paymentMonth: month },
      });

      const totalGross = Number(payrollRun.totalGrossSalary || 0);
      const totalDeductions = Number(payrollRun.totalDeductions || 0);
      const totalNet = Number(payrollRun.totalNetSalary || 0);

      // Calculate statutory totals
      const statutoryTotal = statutoryPayments.reduce(
        (sum, p) => sum + Number(p.totalAmount || 0),
        0
      );
      const paidStatutory = statutoryPayments
        .filter((p) => p.isPaid)
        .reduce((sum, p) => sum + Number(p.totalAmount || 0), 0);

      // Calculate per-payslip reconciliation
      const payslipReconciliation = payrollRun.payslips.map((ps) => {
        const earnings = Number(ps.totalEarnings || 0);
        const deductions = Number(ps.totalDeductions || 0);
        const netPay = earnings - deductions;
        return {
          employeeId: ps.employeeId,
          employeeName: ps.employeeName,
          employeeCode: ps.employeeCode,
          grossPay: earnings,
          deductions,
          netPay,
          status: ps.status,
        };
      });

      // Calculate basic salary total from payslips
      const basicTotal = payrollRun.payslips.reduce(
        (sum, ps) => sum + Number(ps.basicSalary || 0),
        0
      );
      const earningsTotal = payrollRun.payslips.reduce(
        (sum, ps) => sum + Number(ps.totalEarnings || 0),
        0
      );
      const deductionsTotal = payrollRun.payslips.reduce(
        (sum, ps) => sum + Number(ps.totalDeductions || 0),
        0
      );

      const variance = totalNet - (earningsTotal - deductionsTotal);

      const reconciliation = {
        month,
        payrollRunId: payrollRun.id,
        payrollRunStatus: payrollRun.status,
        summary: {
          totalEmployees: payrollRun.totalEmployees || payrollRun.payslips.length,
          processedPayroll: totalNet,
          actualDisbursed: payrollRun.status === 'PAID' ? totalNet : 0,
          variance: Math.abs(variance),
          variancePercentage: totalNet > 0 ? (Math.abs(variance) / totalNet) * 100 : 0,
          totalGross,
          totalDeductions,
          totalNet,
          statutoryTotal,
          paidStatutory,
          pendingStatutory: statutoryTotal - paidStatutory,
        },
        payslips: payslipReconciliation,
        byCategory: {
          basicSalary: { expected: basicTotal, actual: basicTotal, variance: 0 },
          totalEarnings: { expected: earningsTotal, actual: earningsTotal, variance: 0 },
          totalDeductions: { expected: deductionsTotal, actual: deductionsTotal, variance: 0 },
          statutory: {
            expected: statutoryTotal,
            actual: paidStatutory,
            variance: statutoryTotal - paidStatutory,
          },
        },
        discrepancies: payslipReconciliation.filter(
          (ps) => ps.status === 'CANCELLED' || ps.netPay < 0
        ),
      };

      return NextResponse.json({
        success: true,
        data: reconciliation,
      });
    } catch (error) {
      logger.error('Error fetching reconciliation data:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch reconciliation data' },
        { status: 500 }
      );
    }
  }
);

// POST - Run reconciliation for a specific payroll run
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const body = await request.json();
      const { month, payrollRunId } = body;

      if (!month && !payrollRunId) {
        return NextResponse.json(
          { success: false, error: 'Either month or payrollRunId is required' },
          { status: 400 }
        );
      }

      // Find the payroll run
      let payrollRun;
      if (payrollRunId) {
        payrollRun = await prisma.payrollRun.findFirst({
          where: { id: payrollRunId, tenantId },
          include: { payslips: true },
        });
      } else {
        payrollRun = await prisma.payrollRun.findFirst({
          where: { tenantId, payrollMonth: month },
          orderBy: { createdAt: 'desc' },
          include: { payslips: true },
        });
      }

      if (!payrollRun) {
        return NextResponse.json(
          { success: false, error: 'Payroll run not found' },
          { status: 404 }
        );
      }

      // Calculate discrepancies
      let discrepancyCount = 0;
      let totalVariance = 0;
      for (const ps of payrollRun.payslips) {
        const net = Number(ps.totalEarnings || 0) - Number(ps.totalDeductions || 0);
        if (net < 0 || ps.status === 'CANCELLED') {
          discrepancyCount++;
          totalVariance += Math.abs(net);
        }
      }

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Payroll - Reconciliation',
          details: `Ran reconciliation for ${payrollRun.payrollMonth} - ${discrepancyCount} discrepancies found`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      const result = {
        payrollRunId: payrollRun.id,
        month: payrollRun.payrollMonth,
        status: 'COMPLETED',
        totalDiscrepancies: discrepancyCount,
        totalVariance,
        totalEmployees: payrollRun.payslips.length,
        completedAt: new Date().toISOString(),
      };

      return NextResponse.json({ success: true, data: result });
    } catch (error) {
      logger.error('Error running reconciliation:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to run reconciliation' },
        { status: 500 }
      );
    }
  }
);
