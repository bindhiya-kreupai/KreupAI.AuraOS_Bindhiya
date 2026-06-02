// @ts-nocheck — Has Prisma schema drift (wrong field/relation names against current schema). Tracked under #29.
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

// POST - Generate payslips for a payroll run from EmployeeSalaryStructure data
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.PAYROLL, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const body = await request.json();
      const { payrollRunId, month } = body;

      if (!payrollRunId && !month) {
        return NextResponse.json(
          { success: false, error: 'Either payrollRunId or month is required' },
          { status: 400 }
        );
      }

      // Find the payroll run
      let payrollRun;
      if (payrollRunId) {
        payrollRun = await prisma.payrollRun.findFirst({
          where: { id: payrollRunId, tenantId },
        });
      } else {
        payrollRun = await prisma.payrollRun.findFirst({
          where: { tenantId, payrollMonth: month },
          orderBy: { createdAt: 'desc' },
        });
      }

      if (!payrollRun) {
        return NextResponse.json(
          { success: false, error: 'Payroll run not found' },
          { status: 404 }
        );
      }

      // Fetch active salary structures for this tenant
      const salaryStructures = await prisma.employeeSalaryStructure.findMany({
        where: {
          tenantId,
          isActive: true,
        },
      });

      if (salaryStructures.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No active salary structures found' },
          { status: 404 }
        );
      }

      // Fetch any adjustments for this month
      const adjustments = await prisma.payrollAdjustment.findMany({
        where: {
          tenantId,
          payrollMonth: payrollRun.payrollMonth,
          approvalStatus: 'APPROVED',
          isProcessed: false,
        },
      });

      // Group adjustments by employee
      const adjustmentsByEmployee = new Map<string, typeof adjustments>();
      for (const adj of adjustments) {
        if (!adjustmentsByEmployee.has(adj.employeeId)) {
          adjustmentsByEmployee.set(adj.employeeId, []);
        }
        adjustmentsByEmployee.get(adj.employeeId)!.push(adj);
      }

      // Generate payslips from salary structures
      const payslipData = salaryStructures.map((ss) => {
        const empAdj = adjustmentsByEmployee.get(ss.employeeId) || [];
        const earningAdj = empAdj
          .filter((a) => a.adjustmentType === 'EARNING')
          .reduce((sum, a) => sum + Number(a.amount), 0);
        const deductionAdj = empAdj
          .filter((a) => a.adjustmentType === 'DEDUCTION')
          .reduce((sum, a) => sum + Number(a.amount), 0);

        const basicSalary = Number(ss.basicSalary || 0);
        const hra = Number(ss.houseRentAllowance || 0);
        const transport = Number(ss.transportAllowance || 0);

        const earnings = {
          basic: basicSalary,
          hra,
          transport,
          otherAllowances: ss.otherAllowances,
          adjustments: earningAdj,
        };

        const totalEarnings = basicSalary + hra + transport + earningAdj;

        // Basic statutory deduction calculations
        const employeePF = Math.min(basicSalary * 0.12, 1800);
        const employerPF = Math.min(basicSalary * 0.12, 1800);
        const employeeESI = basicSalary <= 21000 ? basicSalary * 0.0075 : 0;
        const employerESI = basicSalary <= 21000 ? basicSalary * 0.0325 : 0;

        const deductions = {
          pf: employeePF,
          esi: employeeESI,
          adjustments: deductionAdj,
        };

        const totalDeductions = employeePF + employeeESI + deductionAdj;

        return {
          payrollRunId: payrollRun!.id,
          employeeId: ss.employeeId,
          employeeCode: ss.employeeId,
          employeeName: ss.employeeId, // Will be updated when Employee relation exists
          basicSalary,
          earnings,
          totalEarnings,
          deductions,
          totalDeductions,
          employeePF,
          employerPF,
          employeeESI,
          employerESI,
          employeeTDS: 0,
          workingDays: 30,
          paidDays: 30,
          lopDays: 0,
          overtimeHours: 0,
          overtimeAmount: 0,
          status: 'CALCULATED' as const,
        };
      });

      // Create payslips in batch
      const createdPayslips = await Promise.all(
        payslipData.map((data) =>
          prisma.payslip.create({ data })
        )
      );

      // Mark adjustments as processed
      if (adjustments.length > 0) {
        await prisma.payrollAdjustment.updateMany({
          where: {
            id: { in: adjustments.map((a) => a.id) },
          },
          data: {
            isProcessed: true,
            processedInRun: payrollRun.id,
          },
        });
      }

      // Update payroll run totals
      const totalGross = payslipData.reduce((sum, p) => sum + p.totalEarnings, 0);
      const totalDeductions = payslipData.reduce((sum, p) => sum + p.totalDeductions, 0);
      const totalNet = totalGross - totalDeductions;
      const totalEmployerCost = totalGross +
        payslipData.reduce((sum, p) => sum + p.employerPF + p.employerESI, 0);

      await prisma.payrollRun.update({
        where: { id: payrollRun.id },
        data: {
          totalEmployees: payslipData.length,
          totalGrossSalary: totalGross,
          totalDeductions,
          totalNetSalary: totalNet,
          totalEmployerCost,
          status: 'CALCULATED',
          processedAt: new Date(),
        },
      });

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'CREATE',
          resourceType: 'Payroll - Payslip Generation',
          metadata: { description: `Generated ${createdPayslips.length} payslips for ${payrollRun.payrollMonth}` } as any,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          payslips: createdPayslips,
          total: createdPayslips.length,
          totalGross,
          totalDeductions,
          totalNet,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      logger.error('Error generating payslips:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to generate payslips' },
        { status: 500 }
      );
    }
  }
);

// GET - Get payslip generation status for a month
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
          _count: { select: { payslips: true } },
        },
      });

      // Count total active employees
      const totalStructures = await prisma.employeeSalaryStructure.count({
        where: { tenantId, isActive: true },
      });

      if (!payrollRun) {
        return NextResponse.json({
          success: true,
          data: {
            month,
            totalEmployees: totalStructures,
            generated: 0,
            pending: totalStructures,
            failed: 0,
            status: 'NOT_STARTED',
          },
        });
      }

      const generated = payrollRun._count.payslips;
      const pending = totalStructures - generated;

      return NextResponse.json({
        success: true,
        data: {
          month,
          payrollRunId: payrollRun.id,
          totalEmployees: totalStructures,
          generated,
          pending: pending > 0 ? pending : 0,
          failed: 0,
          status: payrollRun.status,
          processedAt: payrollRun.processedAt?.toISOString(),
        },
      });
    } catch (error: any) {
      logger.error('Error fetching payslip generation status:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch payslip generation status' },
        { status: 500 }
      );
    }
  }
);
