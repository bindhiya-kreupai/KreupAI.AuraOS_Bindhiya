import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/statutory/esi/returns
 * Get ESI (Employee State Insurance) returns for a specific month
 *
 * Query Parameters:
 * - month (required): Month in YYYY-MM format
 * - companyId (required): Company ID
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('statutory:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing statutory:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const companyId = searchParams.get('companyId');

    if (!month || !companyId) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E2001', message: 'month and companyId are required in query parameters' },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 400 }
      );
    }

    // Get ESI configuration for this company
    const esiConfig = await prisma.indiaESIConfiguration.findFirst({
      where: { tenantId: user.tenantId, companyId, isActive: true },
    });

    // Query ESI submission for this month
    const submission = esiConfig
      ? await prisma.indiaESISubmission.findFirst({
          where: { tenantId: user.tenantId, configId: esiConfig.id, contributionMonth: month },
          include: {
            records: {
              select: {
                employeeId: true,
                esiNumber: true,
                employeeName: true,
                grossWages: true,
                workingDays: true,
                employeeContribution: true,
                employerContribution: true,
                totalContribution: true,
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

      const runIds = payrollRuns.map((r) => r.id);

      if (runIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: {
            month,
            companyId,
            summary: {
              totalEmployees: 0,
              totalWages: 0,
              employeeContribution: 0,
              employerContribution: 0,
              totalContribution: 0,
            },
            employees: [],
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        });
      }

      // Get payslips with ESI deductions (ESI applies only when gross <= 21000)
      const payslips = await prisma.payslip.findMany({
        where: {
          payrollRunId: { in: runIds },
          employeeESI: { gt: 0 },
        },
        select: {
          employeeId: true,
          employeeCode: true,
          employeeName: true,
          grossSalary: true,
          employeeESI: true,
          employerESI: true,
          workingDays: true,
        },
      });

      const totalWages = payslips.reduce((sum, p) => sum + Number(p.grossSalary), 0);
      const totalEmployeeContribution = payslips.reduce((sum, p) => sum + Number(p.employeeESI), 0);
      const totalEmployerContribution = payslips.reduce((sum, p) => sum + Number(p.employerESI), 0);

      return NextResponse.json({
        success: true,
        data: {
          month,
          companyId,
          establishment: esiConfig
            ? { esicCode: esiConfig.esicCode, esicSubCode: esiConfig.esicSubCode }
            : null,
          summary: {
            totalEmployees: payslips.length,
            totalWages,
            employeeContribution: totalEmployeeContribution,
            employerContribution: totalEmployerContribution,
            totalContribution: totalEmployeeContribution + totalEmployerContribution,
          },
          employees: payslips.map((p) => ({
            employeeCode: p.employeeCode,
            employeeName: p.employeeName,
            grossWages: Number(p.grossSalary),
            employeeESI: Number(p.employeeESI),
            employerESI: Number(p.employerESI),
            totalESI: Number(p.employeeESI) + Number(p.employerESI),
          })),
          generatedAt: new Date().toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        month,
        companyId,
        establishment: esiConfig
          ? { esicCode: esiConfig.esicCode, esicSubCode: esiConfig.esicSubCode }
          : null,
        submission: {
          id: submission.id,
          status: submission.status,
          totalEmployees: submission.totalEmployees,
          totalWages: Number(submission.totalWages),
          totalEmployeeContribution: Number(submission.totalEmployeeContribution),
          totalEmployerContribution: Number(submission.totalEmployerContribution),
          grandTotal: Number(submission.grandTotal),
          challanNumber: submission.challanNumber,
          fileName: submission.fileName,
        },
        employees: submission.records.map((r) => ({
          employeeId: r.employeeId,
          esiNumber: r.esiNumber,
          employeeName: r.employeeName,
          grossWages: Number(r.grossWages),
          workingDays: r.workingDays,
          employeeContribution: Number(r.employeeContribution),
          employerContribution: Number(r.employerContribution),
          totalContribution: Number(r.totalContribution),
          status: r.status,
        })),
        generatedAt: new Date().toISOString(),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error) {
    console.error('[ESI Returns API] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch ESI returns',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 500 }
    );
  }
});
