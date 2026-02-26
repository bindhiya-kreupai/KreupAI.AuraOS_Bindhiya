import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/payroll/runs/[id]/calculate
 * Trigger payroll calculation for a run
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { id } = context.params;

    const run = await prisma.payrollRun.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!run) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Payroll run not found' } },
        { status: 404 }
      );
    }

    if (!['DRAFT', 'CALCULATION_FAILED'].includes(run.status)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4003',
            message: `Cannot calculate payroll run with status: ${run.status}`,
          },
        },
        { status: 422 }
      );
    }

    // Update status to CALCULATING
    await prisma.payrollRun.update({
      where: { id },
      data: {
        status: 'CALCULATING',
        calculationStartedAt: new Date(),
        calculatedBy: user.id,
      },
    });

    // Fetch all active employees for this company
    const employees = await prisma.employee.findMany({
      where: {
        companyId: run.companyId,
        isDeleted: false,
      },
      include: {
        salaryStructure: true,
      },
    });

    let totalGross = 0;
    let totalNet = 0;
    let totalDeductions = 0;
    let processedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process each employee's payslip
    for (const employee of employees) {
      try {
        const grossSalary = employee.salaryStructure?.grossSalary || 0;
        const deductions = grossSalary * 0.1; // Simplified: 10% deductions
        const netSalary = grossSalary - deductions;

        // Upsert payslip
        await prisma.payslip.upsert({
          where: {
            payrollRunId_employeeId: { payrollRunId: id, employeeId: employee.id },
          },
          create: {
            tenantId: user.tenantId,
            payrollRunId: id,
            employeeId: employee.id,
            payrollMonth: run.payrollMonth,
            grossSalary,
            totalDeductions: deductions,
            netSalary,
            status: 'CALCULATED',
            currency: run.currency || 'USD',
          },
          update: {
            grossSalary,
            totalDeductions: deductions,
            netSalary,
            status: 'CALCULATED',
            calculatedAt: new Date(),
          },
        });

        totalGross += grossSalary;
        totalNet += netSalary;
        totalDeductions += deductions;
        processedCount++;
      } catch (empError) {
        errorCount++;
        errors.push(
          `Employee ${employee.employeeCode}: ${empError instanceof Error ? empError.message : 'Unknown error'}`
        );
      }
    }

    const finalStatus = errorCount === 0 ? 'CALCULATED' : 'CALCULATION_FAILED';

    const updated = await prisma.payrollRun.update({
      where: { id },
      data: {
        status: finalStatus,
        totalGrossPay: totalGross,
        totalNetPay: totalNet,
        totalDeductions,
        employeeCount: processedCount,
        calculationCompletedAt: new Date(),
        calculationErrors: errors.length > 0 ? errors : undefined,
      },
    });

    return NextResponse.json({
      success: finalStatus === 'CALCULATED',
      data: {
        run: updated,
        summary: {
          totalEmployees: employees.length,
          processedCount,
          errorCount,
          totalGrossPay: totalGross,
          totalNetPay: totalNet,
          totalDeductions,
          errors: errors.slice(0, 10), // Return first 10 errors
        },
      },
      message:
        finalStatus === 'CALCULATED'
          ? 'Payroll calculated successfully'
          : 'Payroll calculation completed with errors',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    console.error('[Payroll Calculate API] POST Error:', error);

    // Reset run status on failure
    try {
      await prisma.payrollRun.update({
        where: { id: context.params.id },
        data: { status: 'CALCULATION_FAILED' },
      });
    } catch {}

    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to calculate payroll run' } },
      { status: 500 }
    );
  }
});
