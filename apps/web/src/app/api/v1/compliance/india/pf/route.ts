import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/compliance/india/pf
 * Get PF (Provident Fund) summary for a period
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

    // Query PF submissions for the period
    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (month) {
      where.contributionMonth = `${year}-${month.padStart(2, '0')}`;
    }

    const submissions = await prisma.indiaPFSubmission.findMany({
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
      const totalEmployerPF = submissions.reduce((sum, s) => sum + Number(s.totalEmployerPF), 0);
      const totalEmployerEPS = submissions.reduce((sum, s) => sum + Number(s.totalEmployerEPS), 0);
      const totalAdminCharges = submissions.reduce(
        (sum, s) => sum + Number(s.totalAdminCharges),
        0
      );
      const totalEDLI = submissions.reduce((sum, s) => sum + Number(s.totalEDLI), 0);
      const grandTotal = submissions.reduce((sum, s) => sum + Number(s.grandTotal), 0);

      return NextResponse.json({
        success: true,
        data: {
          period: month ? `${year}-${month}` : year,
          totalEmployees,
          totalPFWages: totalWages,
          totalEmployeeContribution,
          totalEmployerPF,
          totalEmployerEPS,
          totalAdminCharges,
          totalEDLICharges: totalEDLI,
          grandTotalDeposit: grandTotal,
          dueDate: `${year}-${month || '01'}-15`,
          submissions: submissions.map((s) => ({
            id: s.id,
            contributionMonth: s.contributionMonth,
            status: s.status,
            totalEmployees: s.totalEmployees,
            grandTotal: Number(s.grandTotal),
            ecrFileName: s.ecrFileName,
            challanNumber: s.challanNumber,
            trrn: s.trrn,
            recordCount: s._count.records,
          })),
          ecrGenerated: submissions.some((s) => s.ecrFileName),
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      });
    }

    // Fall back to payslip aggregation
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

    const pfAgg =
      runIds.length > 0
        ? await prisma.payslip.aggregate({
            where: { payrollRunId: { in: runIds }, employeePF: { gt: 0 } },
            _sum: { basicSalary: true, employeePF: true, employerPF: true, employerPension: true },
            _count: { id: true },
          })
        : null;

    return NextResponse.json({
      success: true,
      data: {
        period: month ? `${year}-${month}` : year,
        totalEmployees: pfAgg?._count?.id || 0,
        totalPFWages: Number(pfAgg?._sum?.basicSalary || 0),
        totalEmployeeContribution: Number(pfAgg?._sum?.employeePF || 0),
        totalEmployerPF: Number(pfAgg?._sum?.employerPF || 0),
        totalEmployerEPS: Number(pfAgg?._sum?.employerPension || 0),
        totalAdminCharges: 0,
        totalEDLICharges: 0,
        grandTotalDeposit:
          Number(pfAgg?._sum?.employeePF || 0) + Number(pfAgg?._sum?.employerPF || 0),
        dueDate: `${year}-${month || '01'}-15`,
        status: 'PENDING',
        ecrGenerated: false,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error) {
    console.error('[India PF API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch PF summary' } },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/compliance/india/pf
 * Generate PF ECR (Electronic Challan cum Return)
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

      // Get PF configuration
      const pfConfig = await prisma.indiaPFConfiguration.findFirst({
        where: { tenantId: user.tenantId, companyId, isActive: true },
      });

      if (!pfConfig) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'E4001', message: 'PF configuration not found for this company' },
          },
          { status: 404 }
        );
      }

      // Get payslips with PF for this month
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
          employeePF: { gt: 0 },
        },
      });

      // Get compliance details for UAN numbers
      const complianceDetails = await prisma.employeeComplianceDetails.findMany({
        where: { employeeId: { in: payslips.map((p) => p.employeeId) }, tenantId: user.tenantId },
      });
      const complianceMap = new Map(complianceDetails.map((c) => [c.employeeId, c]));

      const wageCeiling = Number(pfConfig.wageCeiling);
      const totalEmployeeContribution = payslips.reduce((sum, p) => sum + Number(p.employeePF), 0);
      const totalEmployerPF = payslips.reduce((sum, p) => sum + Number(p.employerPF), 0);
      const totalEmployerEPS = payslips.reduce((sum, p) => sum + Number(p.employerPension), 0);
      const totalWages = payslips.reduce(
        (sum, p) => sum + Math.min(Number(p.basicSalary), wageCeiling),
        0
      );

      // Create PF submission
      const submission = await prisma.indiaPFSubmission.create({
        data: {
          tenantId: user.tenantId,
          configId: pfConfig.id,
          contributionMonth,
          status: 'DRAFT',
          totalEmployees: payslips.length,
          totalWages,
          totalEmployeeContribution,
          totalEmployerPF,
          totalEmployerEPS,
          totalAdminCharges: (totalWages * Number(pfConfig.adminChargesRate)) / 100,
          totalEDLI: (totalWages * Number(pfConfig.edliChargesRate)) / 100,
          grandTotal: totalEmployeeContribution + totalEmployerPF + totalEmployerEPS,
          ecrFileName: `ECR_${year}_${month}_${Date.now()}.txt`,
        },
      });

      // Create PF records
      if (payslips.length > 0) {
        await prisma.indiaPFRecord.createMany({
          data: payslips.map((p) => {
            const compliance = complianceMap.get(p.employeeId);
            const basicWages = Number(p.basicSalary);
            const contributableWages = Math.min(basicWages, wageCeiling);
            return {
              submissionId: submission.id,
              employeeId: p.employeeId,
              uanNumber: compliance?.panNumber || p.employeeCode, // UAN from compliance
              employeeName: p.employeeName,
              basicWages,
              contributableWages,
              employeeContribution: Number(p.employeePF),
              employerPFContribution: Number(p.employerPF),
              employerEPSContribution: Number(p.employerPension),
              ncpDays: Number(p.lopDays || 0),
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
            totalEmployees: payslips.length,
            totalWages,
            totalContribution: Number(submission.grandTotal),
            ecrFileName: submission.ecrFileName,
            status: submission.status,
            generatedAt: new Date().toISOString(),
            generatedBy: user.userId,
          },
          message: 'PF ECR generated successfully',
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('[India PF ECR API] POST Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'E5001', message: 'Failed to generate PF ECR' } },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.PAYROLL_RUN_INITIATED,
    resourceType: 'pf_submission',
    captureRequestBody: true,
  }
);
