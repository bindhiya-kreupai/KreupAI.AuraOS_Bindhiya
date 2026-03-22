import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/statutory/pf/returns
 * Get PF (Provident Fund) returns for a specific month
 *
 * Query Parameters:
 * - month (required): Month in YYYY-MM format
 * - companyId (required): Company ID
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const companyId = searchParams.get('companyId');

    if (!month || !companyId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E2001', message: 'month and companyId are required in query parameters' },
          meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
        },
        { status: 400 }
      );
    }

    // Get PF configuration for this company
    const pfConfig = await prisma.indiaPFConfiguration.findFirst({
      where: { tenantId: user.tenantId, companyId, isActive: true },
    });

    // Query PF submission for this month
    const submission = pfConfig
      ? await prisma.indiaPFSubmission.findFirst({
          where: { tenantId: user.tenantId, configId: pfConfig.id, contributionMonth: month },
          include: {
            records: {
              select: {
                employeeId: true,
                uanNumber: true,
                pfAccountNumber: true,
                employeeName: true,
                basicWages: true,
                dearnessAllowance: true,
                contributableWages: true,
                employeeContribution: true,
                employerPFContribution: true,
                employerEPSContribution: true,
                ncpDays: true,
                status: true,
              },
            },
            _count: { select: { records: true } },
          },
        })
      : null;

    // If no submission exists, aggregate from payslips directly
    if (!submission) {
      const payrollRuns = await prisma.payrollRun.findMany({
        where: {
          tenantId: user.tenantId,
          payrollMonth: month,
          config: { companyId },
          status: { in: ['CALCULATED', 'APPROVED', 'PAID'] },
          isDeleted: false,
        },
        select: { id: true },
      });

      const runIds = payrollRuns.map(r => r.id);

      if (runIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: { month, companyId, summary: { totalEmployees: 0, totalWages: 0, totalEmployeePF: 0, totalEmployerPF: 0 }, employees: [] },
          meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
        });
      }

      // Get payslips with PF deductions
      const payslips = await prisma.payslip.findMany({
        where: {
          payrollRunId: { in: runIds },
          employeePF: { gt: 0 },
        },
        select: {
          employeeId: true,
          employeeCode: true,
          employeeName: true,
          basicSalary: true,
          employeePF: true,
          employerPF: true,
          employerPension: true,
        },
      });

      const totalWages = payslips.reduce((sum, p) => sum + Number(p.basicSalary), 0);
      const totalEmployeePF = payslips.reduce((sum, p) => sum + Number(p.employeePF), 0);
      const totalEmployerPF = payslips.reduce((sum, p) => sum + Number(p.employerPF), 0);
      const totalEmployerPension = payslips.reduce((sum, p) => sum + Number(p.employerPension), 0);

      return NextResponse.json({
        success: true,
        data: {
          month,
          companyId,
          establishment: pfConfig ? {
            epfoEstablishmentId: pfConfig.epfoEstablishmentId,
            epfoRegistrationNumber: pfConfig.epfoRegistrationNumber,
          } : null,
          summary: {
            totalEmployees: payslips.length,
            totalWages,
            totalEmployeePF,
            totalEmployerPF,
            totalEmployerPension,
            grandTotal: totalEmployeePF + totalEmployerPF,
          },
          employees: payslips.map(p => ({
            employeeCode: p.employeeCode,
            employeeName: p.employeeName,
            basicWages: Number(p.basicSalary),
            employeePF: Number(p.employeePF),
            employerPF: Number(p.employerPF),
            employerPension: Number(p.employerPension),
          })),
          ecrGenerated: false,
          generatedAt: new Date().toISOString(),
        },
        meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        month,
        companyId,
        establishment: pfConfig ? {
          epfoEstablishmentId: pfConfig.epfoEstablishmentId,
          epfoRegistrationNumber: pfConfig.epfoRegistrationNumber,
        } : null,
        submission: {
          id: submission.id,
          status: submission.status,
          totalEmployees: submission.totalEmployees,
          totalWages: Number(submission.totalWages),
          totalEmployeeContribution: Number(submission.totalEmployeeContribution),
          totalEmployerPF: Number(submission.totalEmployerPF),
          totalEmployerEPS: Number(submission.totalEmployerEPS),
          totalAdminCharges: Number(submission.totalAdminCharges),
          totalEDLI: Number(submission.totalEDLI),
          grandTotal: Number(submission.grandTotal),
          ecrFileName: submission.ecrFileName,
          challanNumber: submission.challanNumber,
          trrn: submission.trrn,
        },
        employees: submission.records.map(r => ({
          employeeId: r.employeeId,
          uanNumber: r.uanNumber,
          pfAccountNumber: r.pfAccountNumber,
          employeeName: r.employeeName,
          basicWages: Number(r.basicWages),
          contributableWages: Number(r.contributableWages),
          employeeContribution: Number(r.employeeContribution),
          employerPFContribution: Number(r.employerPFContribution),
          employerEPSContribution: Number(r.employerEPSContribution),
          ncpDays: r.ncpDays,
          status: r.status,
        })),
        generatedAt: new Date().toISOString(),
      },
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    });
  } catch (error) {
    console.error('[PF Returns API] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'E5001', message: 'Failed to fetch PF returns', details: { error: error instanceof Error ? error.message : 'Unknown error' } },
        meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
      },
      { status: 500 }
    );
  }
});
