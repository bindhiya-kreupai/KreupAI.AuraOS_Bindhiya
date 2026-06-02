import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/compliance/india/esi
 * Get ESI (Employee State Insurance) summary for a period
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('compliance/india:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing compliance/india:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);

    const month = searchParams.get('month');
    const year = searchParams.get('year') || String(new Date().getFullYear());
    const companyId = searchParams.get('companyId');

    // Query ESI submissions for the period
    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (month) {
      where.contributionMonth = `${year}-${month.padStart(2, '0')}`;
    }

    const submissions = await prisma.indiaESISubmission.findMany({
      where,
      orderBy: { contributionMonth: 'desc' },
      include: { _count: { select: { records: true } } },
    });

    if (submissions.length > 0) {
      const totalEmployees = submissions.reduce((sum, s) => sum + s.totalEmployees, 0);
      const totalWages = submissions.reduce((sum, s) => sum + Number(s.totalWages), 0);
      const totalEmployeeContribution = submissions.reduce(
        (sum, s) => sum + Number(s.totalEmployeeContribution),
        0
      );
      const totalEmployerContribution = submissions.reduce(
        (sum, s) => sum + Number(s.totalEmployerContribution),
        0
      );
      const grandTotal = submissions.reduce((sum, s) => sum + Number(s.grandTotal), 0);

      return NextResponse.json({
        success: true,
        data: {
          period: month ? `${year}-${month}` : year,
          totalESIEligibleEmployees: totalEmployees,
          totalESIWages: totalWages,
          totalEmployeeContribution,
          totalEmployerContribution,
          grandTotalContribution: grandTotal,
          dueDate: `${year}-${month || '01'}-15`,
          submissions: submissions.map((s) => ({
            id: s.id,
            contributionMonth: s.contributionMonth,
            status: s.status,
            totalEmployees: s.totalEmployees,
            totalWages: Number(s.totalWages),
            grandTotal: Number(s.grandTotal),
            challanNumber: s.challanNumber,
            recordCount: s._count.records,
          })),
          halfYearlyReturn: parseInt(month || '6') <= 6 ? `${year}-H1` : `${year}-H2`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      });
    }

    // Fall back to payslip aggregation if no submissions exist
    const payrollRuns = await prisma.payrollRun.findMany({
      where: {
        tenantId: user.tenantId,
        payrollMonth: month ? `${year}-${month.padStart(2, '0')}` : { startsWith: year },
        status: { in: ['CALCULATED', 'APPROVED', 'PAID'] },
        isDeleted: false,
        ...(companyId ? { config: { companyId } } : {}),
      },
      select: { id: true },
    });

    const runIds = payrollRuns.map((r) => r.id);

    const esiAgg =
      runIds.length > 0
        ? await prisma.payslip.aggregate({
            where: { payrollRunId: { in: runIds }, employeeESI: { gt: 0 } },
            _sum: { grossSalary: true, employeeESI: true, employerESI: true },
            _count: { id: true },
          })
        : null;

    return NextResponse.json({
      success: true,
      data: {
        period: month ? `${year}-${month}` : year,
        totalESIEligibleEmployees: esiAgg?._count?.id || 0,
        totalESIWages: Number(esiAgg?._sum?.grossSalary || 0),
        totalEmployeeContribution: Number(esiAgg?._sum?.employeeESI || 0),
        totalEmployerContribution: Number(esiAgg?._sum?.employerESI || 0),
        grandTotalContribution:
          Number(esiAgg?._sum?.employeeESI || 0) + Number(esiAgg?._sum?.employerESI || 0),
        dueDate: `${year}-${month || '01'}-15`,
        status: 'PENDING',
        returnFiled: false,
        halfYearlyReturn: parseInt(month || '6') <= 6 ? `${year}-H1` : `${year}-H2`,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[India ESI API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch ESI summary' } },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/compliance/india/esi
 * Generate ESI return — creates IndiaESISubmission + IndiaESIRecord entries
 */
export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, permissions } = context;
      if (!permissions.includes('compliance/india:create')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing compliance/india:create permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const body = await request.json();

      const { month, year, companyId } = body;

      if (!month || !year || !companyId) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'E2001', message: 'month, year and companyId are required' },
          },
          { status: 400 }
        );
      }

      const contributionMonth = `${year}-${String(month).padStart(2, '0')}`;

      // Get ESI configuration
      const esiConfig = await prisma.indiaESIConfiguration.findFirst({
        where: { tenantId: user.tenantId, companyId, isActive: true },
      });

      if (!esiConfig) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'E4001', message: 'ESI configuration not found for this company' },
          },
          { status: 404 }
        );
      }

      // Get payslips with ESI for this month
      const payrollRuns = await prisma.payrollRun.findMany({
        where: {
          tenantId: user.tenantId,
          payrollMonth: contributionMonth,
          config: { companyId },
          status: { in: ['CALCULATED', 'APPROVED', 'PAID'] },
          isDeleted: false,
        },
        select: { id: true },
      });

      const payslips = await prisma.payslip.findMany({
        where: {
          payrollRunId: { in: payrollRuns.map((r) => r.id) },
          employeeESI: { gt: 0 },
        },
      });

      // Create ESI submission
      const submission = await prisma.indiaESISubmission.create({
        data: {
          tenantId: user.tenantId,
          configId: esiConfig.id,
          contributionMonth,
          status: 'DRAFT',
          totalEmployees: payslips.length,
          totalWages: payslips.reduce((sum, p) => sum + Number(p.grossSalary), 0),
          totalEmployeeContribution: payslips.reduce((sum, p) => sum + Number(p.employeeESI), 0),
          totalEmployerContribution: payslips.reduce((sum, p) => sum + Number(p.employerESI), 0),
          grandTotal: payslips.reduce(
            (sum, p) => sum + Number(p.employeeESI) + Number(p.employerESI),
            0
          ),
          fileName: `ESI_RETURN_${year}_${month}_${Date.now()}.xlsx`,
        },
      });

      // Create ESI records
      if (payslips.length > 0) {
        // Get compliance details for ESI numbers
        const complianceDetails = await prisma.employeeComplianceDetails.findMany({
          where: { employeeId: { in: payslips.map((p) => p.employeeId) }, tenantId: user.tenantId },
        });
        const complianceMap = new Map(complianceDetails.map((c) => [c.employeeId, c]));

        await prisma.indiaESIRecord.createMany({
          data: payslips.map((p) => {
            const compliance = complianceMap.get(p.employeeId);
            return {
              submissionId: submission.id,
              employeeId: p.employeeId,
              esiNumber: compliance?.iqamaNumber || p.employeeCode, // ESI IP number
              employeeName: p.employeeName,
              grossWages: p.grossSalary,
              workingDays: p.workingDays,
              employeeContribution: p.employeeESI,
              employerContribution: p.employerESI,
              totalContribution: Number(p.employeeESI) + Number(p.employerESI),
              status: 'PENDING',
            };
          }),
        });
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            submissionId: submission.id,
            period: contributionMonth,
            companyId,
            halfYear: parseInt(month) <= 6 ? `${year}-H1` : `${year}-H2`,
            totalESIEligibleEmployees: payslips.length,
            totalWages: Number(submission.totalWages),
            totalContribution: Number(submission.grandTotal),
            fileName: submission.fileName,
            status: submission.status,
            generatedAt: new Date().toISOString(),
            generatedBy: user.userId,
          },
          message: 'ESI return generated successfully',
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 201 }
      );
    } catch (error: any) {
      console.error('[India ESI Return API] POST Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'E5001', message: 'Failed to generate ESI return' } },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.PAYROLL_RUN_INITIATED,
    resourceType: 'esi_submission',
    captureRequestBody: true,
  }
);
