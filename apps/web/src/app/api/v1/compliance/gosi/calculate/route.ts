import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

// GOSI contribution rates for KSA (Saudi Arabia) — 2024
const GOSI_RATES = {
  SAUDI: {
    employeePension: 0.0975, // 9.75% employee pension/annuity
    employerPension: 0.0975, // 9.75% employer pension/annuity
    employeeSaned: 0.0075, // 0.75% SANED (unemployment insurance)
    employerSaned: 0.0075, // 0.75% SANED
    employerOccHazards: 0.02, // 2% occupational hazards (employer only)
  },
  NON_SAUDI: {
    employeeSaned: 0.02, // 2% SANED only
    employerSaned: 0.02, // 2% SANED only
    employerOccHazards: 0.02, // 2% occupational hazards (employer only)
  },
  MAX_CONTRIBUTABLE_SALARY: 45000, // SAR cap
};

/**
 * POST /api/v1/compliance/gosi/calculate
 * Calculate GOSI contributions for a company/payroll period
 */
export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, permissions } = context;
      if (!permissions.includes('compliance/gosi:create')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing compliance/gosi:create permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const body = await request.json();

      const { contributionMonth, companyId, _payrollRunId } = body;

      if (!contributionMonth || !companyId) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'E2001', message: 'contributionMonth and companyId are required' },
          },
          { status: 400 }
        );
      }

      // Get GOSI configuration
      const gosiConfig = await prisma.gOSIConfiguration.findFirst({
        where: { tenantId: user.tenantId, companyId, isActive: true },
      });

      if (!gosiConfig) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4001',
              message: 'GOSI configuration not found. Please configure GOSI settings.',
            },
          },
          { status: 404 }
        );
      }

      // Create submission record
      const submission = await prisma.gOSISubmission.create({
        data: {
          tenantId: user.tenantId,
          gosiConfigId: gosiConfig.id,
          contributionMonth,
          status: 'VALIDATING',
        },
      });

      // Get active employees for this company
      const employees = await prisma.employee.findMany({
        where: { companyId, isDeleted: false },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeCode: true,
        },
      });

      const employeeIds = employees.map((e) => e.id);

      // Fetch salary structures and compliance details in parallel
      const [salaryStructures, complianceDetails] = await Promise.all([
        prisma.employeeSalaryStructure.findMany({
          where: { employeeId: { in: employeeIds }, tenantId: user.tenantId, isActive: true },
        }),
        prisma.employeeComplianceDetails.findMany({
          where: { employeeId: { in: employeeIds }, tenantId: user.tenantId },
        }),
      ]);

      const salaryMap = new Map(salaryStructures.map((s) => [s.employeeId, s]));
      const complianceMap = new Map(complianceDetails.map((c) => [c.employeeId, c]));

      let totalSaudis = 0;
      let totalNonSaudis = 0;
      let totalEmployeeContribution = 0;
      let totalEmployerContribution = 0;
      let totalPensionContribution = 0;
      let totalSanedContribution = 0;
      let totalOccupationalHazards = 0;

      for (const employee of employees) {
        const salary = salaryMap.get(employee.id);
        const compliance = complianceMap.get(employee.id);

        const basicSalary = Number(salary?.basicSalary || 0);
        const housingAllowance = Number(salary?.houseRentAllowance || basicSalary * 0.25);
        const grossForGosi = basicSalary + housingAllowance;

        // Apply 45K SAR salary cap
        const contributableSalary = Math.min(grossForGosi, GOSI_RATES.MAX_CONTRIBUTABLE_SALARY);

        // Determine nationality from compliance details
        const isSaudi = compliance?.isLocalNational === true;
        const nationality = compliance?.nationality || 'XX';
        const nationalId = compliance?.iqamaNumber || '';

        let employeeContrib = 0;
        let employerContrib = 0;
        let pensionContrib = 0;
        let sanedContrib = 0;
        let empPension = 0;
        let emplrPension = 0;
        let empSaned = 0;
        let emplrSaned = 0;
        const occHazards = contributableSalary * GOSI_RATES.NON_SAUDI.employerOccHazards;

        if (isSaudi) {
          // Saudi: Pension (9.75% each) + SANED (0.75% each) + Occ Hazards (2% employer)
          empPension = contributableSalary * GOSI_RATES.SAUDI.employeePension;
          emplrPension = contributableSalary * GOSI_RATES.SAUDI.employerPension;
          empSaned = contributableSalary * GOSI_RATES.SAUDI.employeeSaned;
          emplrSaned = contributableSalary * GOSI_RATES.SAUDI.employerSaned;

          employeeContrib = empPension + empSaned;
          employerContrib = emplrPension + emplrSaned + occHazards;
          pensionContrib = empPension + emplrPension;
          sanedContrib = empSaned + emplrSaned;
          totalSaudis++;
        } else {
          // Non-Saudi: SANED (2% each) + Occ Hazards (2% employer), NO pension
          empSaned = contributableSalary * GOSI_RATES.NON_SAUDI.employeeSaned;
          emplrSaned = contributableSalary * GOSI_RATES.NON_SAUDI.employerSaned;

          employeeContrib = empSaned;
          employerContrib = emplrSaned + occHazards;
          sanedContrib = empSaned + emplrSaned;
          totalNonSaudis++;
        }

        await prisma.gOSIRecord.create({
          data: {
            submissionId: submission.id,
            employeeId: employee.id,
            iqamaNumber: !isSaudi ? nationalId : null,
            nationalId: isSaudi ? nationalId : null,
            nationality,
            isSaudi,
            contributableSalary,
            basicSalary,
            housingAllowance,
            employeePension: empPension,
            employerPension: emplrPension,
            sanedEmployee: empSaned,
            sanedEmployer: emplrSaned,
            occupationalHazards: occHazards,
            totalEmployee: employeeContrib,
            totalEmployer: employerContrib,
            status: 'VALID',
          },
        });

        totalEmployeeContribution += employeeContrib;
        totalEmployerContribution += employerContrib;
        totalPensionContribution += pensionContrib;
        totalSanedContribution += sanedContrib;
        totalOccupationalHazards += occHazards;
      }

      const grandTotal = totalEmployeeContribution + totalEmployerContribution;

      const updated = await prisma.gOSISubmission.update({
        where: { id: submission.id },
        data: {
          status: 'VALIDATED',
          totalEmployees: employees.length,
          totalSaudis,
          totalNonSaudis,
          totalEmployeeContribution,
          totalEmployerContribution,
          totalPensionContribution,
          totalSanedContribution,
          totalOccupationalHazards,
          grandTotal,
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: {
            submission: {
              id: updated.id,
              status: updated.status,
              contributionMonth: updated.contributionMonth,
              totalEmployees: updated.totalEmployees,
              totalSaudis: updated.totalSaudis,
              totalNonSaudis: updated.totalNonSaudis,
              totalEmployeeContribution: Number(updated.totalEmployeeContribution),
              totalEmployerContribution: Number(updated.totalEmployerContribution),
              totalPensionContribution: Number(updated.totalPensionContribution),
              totalSanedContribution: Number(updated.totalSanedContribution),
              totalOccupationalHazards: Number(updated.totalOccupationalHazards),
              grandTotal: Number(updated.grandTotal),
            },
            rates: {
              saudiEmployee: '10.50% (9.75% pension + 0.75% SANED)',
              saudiEmployer: '12.50% (9.75% pension + 0.75% SANED + 2% hazards)',
              nonSaudiEmployee: '2.00% (SANED)',
              nonSaudiEmployer: '4.00% (2% SANED + 2% hazards)',
              salaryCap: GOSI_RATES.MAX_CONTRIBUTABLE_SALARY,
            },
          },
          message: 'GOSI contributions calculated successfully',
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 201 }
      );
    } catch (error: any) {
      console.error('[GOSI Calculate API] POST Error:', error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E5001',
            message: 'Failed to calculate GOSI contributions',
            details: { error: error instanceof Error ? error.message : 'Unknown error' },
          },
        },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.PAYROLL_RUN_INITIATED,
    resourceType: 'gosi_submission',
    captureRequestBody: true,
  }
);
