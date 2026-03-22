import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';
import { PayrollService } from '@/lib/services/payroll/payroll.service';
import type { SupportedCountryCode } from '@/lib/services/compliance/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/payroll/runs/[id]/calculate
 * Trigger payroll calculation for a run — transitions DRAFT → CALCULATED
 */
export const POST = withAudit(withEnhancedAuth(async (request: NextRequest, context: any) => {
  const { user } = context;
  const { id } = context.params;

  try {
    const body = await request.json().catch(() => ({}));

    // Find run with its configuration
    const run = await prisma.payrollRun.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
      include: { config: true },
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

    if (run.status !== 'DRAFT') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E4003', message: `Cannot calculate payroll run with status: ${run.status}. Must be DRAFT.` },
          meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
        },
        { status: 422 }
      );
    }

    // Mark as PROCESSING
    await prisma.payrollRun.update({
      where: { id },
      data: { status: 'PROCESSING' },
    });

    // Determine country code
    const countryCode = (body.countryCode || 'AE') as SupportedCountryCode;

    // Run the real calculation engine
    const result = await PayrollService.processPayroll({
      tenantId: user.tenantId,
      companyId: run.config.companyId,
      month: run.payrollMonth,
      countryCode,
      employeeIds: body.employeeIds,
    });

    // Clear existing payslips for this run (supports recalculation)
    await prisma.payslip.deleteMany({ where: { payrollRunId: id } });

    // Persist calculated payslips
    if (result.payslips.length > 0) {
      await prisma.payslip.createMany({
        data: result.payslips.map(p => ({
          payrollRunId: id,
          employeeId: p.employeeId,
          employeeCode: p.employeeCode,
          employeeName: p.employeeName,
          basicSalary: p.basicSalary,
          earnings: p.earnings as any,
          totalEarnings: p.totalEarnings,
          deductions: p.deductions as any,
          totalDeductions: p.totalDeductions,
          employeePF: p.statutoryDeductions.find(s => s.code === 'PF_EMPLOYEE')?.employeeAmount || 0,
          employeeESI: p.statutoryDeductions.find(s => s.code === 'ESI')?.employeeAmount || 0,
          employeeTDS: p.taxDetails?.monthlyTds || 0,
          employeeSaned: p.statutoryDeductions.find(s => s.code === 'GOSI_SANED')?.employeeAmount || 0,
          employeePension: p.statutoryDeductions.find(s => s.code === 'GOSI_PENSION')?.employeeAmount || 0,
          totalStatutoryEmployee: p.totalStatutory,
          employerPF: p.statutoryDeductions.find(s => s.code === 'PF_EMPLOYEE')?.employerAmount || 0,
          employerESI: p.statutoryDeductions.find(s => s.code === 'ESI')?.employerAmount || 0,
          employerGOSI:
            (p.statutoryDeductions.find(s => s.code === 'GOSI_PENSION')?.employerAmount || 0) +
            (p.statutoryDeductions.find(s => s.code === 'GOSI_SANED')?.employerAmount || 0) +
            (p.statutoryDeductions.find(s => s.code === 'GOSI_OCC_HAZARDS')?.employerAmount || 0),
          employerPension: p.statutoryDeductions.find(s => s.code === 'GOSI_PENSION')?.employerAmount || 0,
          totalStatutoryEmployer: p.statutoryDeductions.reduce((sum, s) => sum + s.employerAmount, 0),
          grossSalary: p.grossSalary,
          netSalary: p.netSalary,
          workingDays: p.totalWorkingDays,
          paidDays: p.daysWorked + p.paidLeaveDays,
          lopDays: p.lopDays,
          overtimeHours: 0,
          overtimeAmount: 0,
          status: 'CALCULATED',
          createdBy: user.userId,
        })),
      });
    }

    // Update run with calculated totals
    const updated = await prisma.payrollRun.update({
      where: { id },
      data: {
        status: 'CALCULATED',
        processedAt: new Date(),
        totalEmployees: result.totalEmployees,
        totalGrossSalary: result.totalGross,
        totalDeductions: result.totalDeductions,
        totalNetSalary: result.totalNet,
        totalEmployerCost: result.totalStatutory + result.totalNet,
        currency: result.currency,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        run: {
          id: updated.id,
          status: updated.status,
          payrollMonth: updated.payrollMonth,
          totalEmployees: updated.totalEmployees,
          totalGrossSalary: Number(updated.totalGrossSalary),
          totalDeductions: Number(updated.totalDeductions),
          totalNetSalary: Number(updated.totalNetSalary),
          processedAt: updated.processedAt?.toISOString(),
        },
        summary: {
          totalEmployees: result.totalEmployees,
          payslipsCreated: result.payslips.length,
          totalGross: result.totalGross,
          totalNet: result.totalNet,
          totalDeductions: result.totalDeductions,
          totalStatutory: result.totalStatutory,
        },
      },
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    });
  } catch (error) {
    console.error('[Payroll Calculate API] POST Error:', error);

    // Reset run status on failure
    try {
      await prisma.payrollRun.update({
        where: { id },
        data: { status: 'DRAFT', notes: `Calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      });
    } catch { /* ignore recovery errors */ }

    return NextResponse.json(
      {
        success: false,
        error: { code: 'E5001', message: error instanceof Error ? error.message : 'Failed to calculate payroll run' },
        meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
      },
      { status: 500 }
    );
  }
}), {
  action: AuditAction.PAYROLL_RUN_INITIATED,
  resourceType: 'payroll_run',
  extractResourceId: (req: any, ctx: any) => ctx?.params?.id,
});
