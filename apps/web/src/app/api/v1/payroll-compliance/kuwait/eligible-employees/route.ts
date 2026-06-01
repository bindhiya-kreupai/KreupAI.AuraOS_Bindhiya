import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

/**
 * GET /api/v1/payroll-compliance/kuwait/eligible-employees
 *
 * Returns the employees eligible for Kuwait PIFSS calculation in this
 * tenant. The Kuwait PIFSS calculator endpoint expects this exact shape:
 *
 *   {
 *     employees: [{
 *       employeeId, employeeName, nationality, sector,
 *       basicSalary, socialAllowance
 *     }],
 *     month: 'YYYY-MM'
 *   }
 *
 * Replaces the hardcoded 3-employee fixture that the Kuwait PIFSS dashboard
 * was using (apps/web/src/app/dashboard/payroll-compliance/kuwait-pifss/page.tsx
 * had a FIXME(#36) block pointing here).
 *
 * Eligibility criteria:
 *   - Employee belongs to the authenticated tenant
 *   - EmployeeComplianceDetails.countryCode = 'KW'
 *   - sector and nationality are configured (NULL means not applicable)
 *   - Active EmployeeSalaryStructure exists with basicSalary > 0
 *
 * socialAllowance comes from EmployeeSalaryStructure.otherAllowances[] —
 * we look for an entry with code = 'SOCIAL' or 'SOCIAL_ALLOWANCE'. If
 * absent, defaults to 0.
 */

interface OtherAllowance {
  code: string;
  name?: string;
  amount: number;
}

export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  if (!permissions.includes('payroll-compliance:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing payroll-compliance:read permission',
          messageAr: 'ممنوع: صلاحية قراءة الامتثال للرواتب غير متوفرة',
        },
      },
      { status: 403 }
    );
  }

  try {
    const tenantId = user.tenantId;

    // Find every employee in this tenant with Kuwait compliance details +
    // an active salary structure. Use a Prisma findMany with includes.
    const employees = await prisma.employee.findMany({
      where: {
        company: { tenantId },
        // EmployeeComplianceDetails 1:1 — Prisma generates a `complianceDetails`
        // accessor if @relation is declared. If the relation isn't yet wired
        // (or named differently), the include below will surface it clearly
        // at runtime.
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    // Pull compliance details + active salary structure in a separate query
    // because the relation field may not be declared on Employee yet. This
    // is two queries instead of one but avoids cross-cutting schema changes.
    const employeeIds = employees.map((e) => e.id);

    const [complianceRows, salaryRows] = await Promise.all([
      prisma.employeeComplianceDetails.findMany({
        where: {
          tenantId,
          employeeId: { in: employeeIds },
          countryCode: 'KW',
          nationality: { not: null },
          sector: { not: null },
        },
        select: {
          employeeId: true,
          nationality: true,
          sector: true,
        },
      }),
      prisma.employeeSalaryStructure.findMany({
        where: {
          tenantId,
          employeeId: { in: employeeIds },
          isActive: true,
          basicSalary: { gt: 0 },
          // Pick the most recently effective active structure per employee
          effectiveTo: null,
        },
        select: {
          employeeId: true,
          basicSalary: true,
          otherAllowances: true,
        },
      }),
    ]);

    // Index by employeeId for the join
    const complianceByEmployee = new Map(complianceRows.map((c) => [c.employeeId, c]));
    const salaryByEmployee = new Map(salaryRows.map((s) => [s.employeeId, s]));

    // Build the final response — only employees that have BOTH a Kuwait
    // compliance row and an active salary structure are eligible
    const eligible = employees
      .map((emp) => {
        const compliance = complianceByEmployee.get(emp.id);
        const salary = salaryByEmployee.get(emp.id);
        if (!compliance || !salary || !compliance.sector || !compliance.nationality) {
          return null;
        }
        // Extract socialAllowance from otherAllowances JSON array
        let socialAllowance = 0;
        if (Array.isArray(salary.otherAllowances)) {
          const social = (salary.otherAllowances as unknown as OtherAllowance[]).find(
            (a) =>
              a?.code === 'SOCIAL' ||
              a?.code === 'SOCIAL_ALLOWANCE' ||
              a?.code === 'KUWAIT_SOCIAL_ALLOWANCE'
          );
          socialAllowance = Number(social?.amount ?? 0);
        }
        return {
          employeeId: emp.id,
          employeeName: `${emp.firstName} ${emp.lastName}`,
          nationality: compliance.nationality,
          sector: compliance.sector,
          basicSalary: Number(salary.basicSalary),
          socialAllowance,
        };
      })
      .filter((e): e is NonNullable<typeof e> => e !== null);

    return NextResponse.json({
      success: true,
      data: {
        employees: eligible,
        asOfDate: new Date().toISOString(),
        eligibilityCriteria: {
          countryCode: 'KW',
          requiresSector: true,
          requiresNationality: true,
          requiresActiveSalary: true,
        },
        meta: {
          totalEmployeesInTenant: employees.length,
          eligibleCount: eligible.length,
        },
      },
    });
  } catch (err: any) {
    logger.error({ err, tenantId: user.tenantId }, 'kuwait/eligible-employees: query failed');
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch eligible employees',
        errorAr: 'فشل في جلب الموظفين المؤهلين',
      },
      { status: 500 }
    );
  }
});
