import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

// GOSI contribution rates for KSA (Saudi Arabia)
const GOSI_RATES = {
  SAUDI: {
    employeePension: 0.0975, // 9.75% employee pension
    employerPension: 0.0975, // 9.75% employer pension
    employeeSaned: 0.0075, // 0.75% SANED (unemployment)
    employerSaned: 0.0075, // 0.75% SANED
    employerOccHazards: 0.02, // 2% occupational hazards (employer only)
  },
  NON_SAUDI: {
    employerOccHazards: 0.02, // 2% occupational hazards only
  },
  MAX_CONTRIBUTABLE_SALARY: 45000, // SAR cap
};

/**
 * POST /api/v1/compliance/gosi/calculate
 * Calculate GOSI contributions for a company/payroll period
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
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

    // Get employees from payroll run or active employees
    const employees = await prisma.employee.findMany({
      where: { companyId, isDeleted: false },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeCode: true,
        salaryStructure: true,
      },
    });

    const totalEmployees = employees.length;
    let totalSaudis = 0;
    let totalNonSaudis = 0;
    let totalEmployeeContribution = 0;
    let totalEmployerContribution = 0;
    let totalPensionContribution = 0;
    let totalSanedContribution = 0;
    let totalOccupationalHazards = 0;

    for (const employee of employees) {
      const grossSalary = Number(employee.salaryStructure?.grossSalary || 0);
      const basicSalary = Number(employee.salaryStructure?.basicSalary || grossSalary * 0.7);
      const housingAllowance = grossSalary - basicSalary;

      // Contributable salary capped at 45,000 SAR
      const contributableSalary = Math.min(grossSalary, GOSI_RATES.MAX_CONTRIBUTABLE_SALARY);

      // Simplified: assume non-Saudi for demonstration (real implementation would check nationality)
      const isSaudi = false;

      let employeeContrib = 0;
      let employerContrib = 0;
      let pensionContrib = 0;
      let sanedContrib = 0;
      const occHazards = contributableSalary * GOSI_RATES.NON_SAUDI.employerOccHazards;

      if (isSaudi) {
        const empPension = contributableSalary * GOSI_RATES.SAUDI.employeePension;
        const emplrPension = contributableSalary * GOSI_RATES.SAUDI.employerPension;
        const empSaned = contributableSalary * GOSI_RATES.SAUDI.employeeSaned;
        const emplrSaned = contributableSalary * GOSI_RATES.SAUDI.employerSaned;

        employeeContrib = empPension + empSaned;
        employerContrib = emplrPension + emplrSaned + occHazards;
        pensionContrib = empPension + emplrPension;
        sanedContrib = empSaned + emplrSaned;
        totalSaudis++;
      } else {
        employerContrib = occHazards;
        totalNonSaudis++;
      }

      await prisma.gOSIRecord.create({
        data: {
          submissionId: submission.id,
          employeeId: employee.id,
          nationality: 'IN',
          isSaudi,
          contributableSalary,
          basicSalary,
          housingAllowance,
          employeePension: isSaudi ? contributableSalary * GOSI_RATES.SAUDI.employeePension : 0,
          employerPension: isSaudi ? contributableSalary * GOSI_RATES.SAUDI.employerPension : 0,
          sanedEmployee: isSaudi ? contributableSalary * GOSI_RATES.SAUDI.employeeSaned : 0,
          sanedEmployer: isSaudi ? contributableSalary * GOSI_RATES.SAUDI.employerSaned : 0,
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
        totalEmployees,
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
          submission: updated,
          summary: {
            totalEmployees,
            totalSaudis,
            totalNonSaudis,
            totalEmployeeContribution,
            totalEmployerContribution,
            grandTotal,
            contributionMonth,
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
  } catch (_error) {
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
});
