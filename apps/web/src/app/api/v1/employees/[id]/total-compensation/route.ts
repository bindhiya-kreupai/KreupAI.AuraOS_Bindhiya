import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/employees/[id]/total-compensation
 * Compute total compensation from EmployeeSalaryStructure + BenefitEnrollment
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('employees:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing employees:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const employeeId = pathParts[pathParts.indexOf('employees') + 1];

    const { searchParams } = url;
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    // Verify employee belongs to this tenant
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, company: { tenantId: user.tenantId } },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E3001',
            message: 'Employee not found',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 404 }
      );
    }

    // Fetch active salary structure for the employee
    const salaryStructure = await prisma.employeeSalaryStructure.findFirst({
      where: {
        tenantId: user.tenantId,
        employeeId,
        isActive: true,
        effectiveFrom: { lte: new Date(`${year}-12-31`) },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date(`${year}-01-01`) } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });

    // Fetch active benefit enrollments for the employee
    const benefitEnrollments = await prisma.benefitEnrollment.findMany({
      where: {
        tenantId: user.tenantId,
        employeeId,
        status: 'ACTIVE',
        effectiveFrom: { lte: new Date(`${year}-12-31`) },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date(`${year}-01-01`) } }],
      },
      include: {
        plan: {
          select: {
            id: true,
            planName: true,
            category: true,
            carrierName: true,
          },
        },
      },
    });

    // Compute salary components
    const basicSalary = salaryStructure ? Number(salaryStructure.basicSalary) : 0;
    const hra = salaryStructure ? Number(salaryStructure.houseRentAllowance) : 0;
    const transportAllowance = salaryStructure ? Number(salaryStructure.transportAllowance) : 0;
    const grossSalary = salaryStructure ? Number(salaryStructure.grossSalary) : 0;
    const ctc = salaryStructure ? Number(salaryStructure.ctc) : 0;
    const payFrequency = salaryStructure?.payFrequency || 'MONTHLY';

    // Determine multiplier for annualizing salary
    const annualMultiplier =
      payFrequency === 'MONTHLY' ? 12 : payFrequency === 'BIWEEKLY' ? 26 : 52;
    const annualBaseSalary = basicSalary * annualMultiplier;
    const annualGrossSalary = grossSalary * annualMultiplier;

    // Compute benefits breakdown
    const benefitsBreakdown = benefitEnrollments.map((enrollment) => ({
      planId: enrollment.planId,
      planName: enrollment.plan.planName,
      category: enrollment.plan.category,
      carrierName: enrollment.plan.carrierName,
      employeePremium: enrollment.employeePremium,
      employerPremium: enrollment.employerPremium,
      totalPremium: enrollment.totalPremium,
      paymentFrequency: enrollment.paymentFrequency,
      coverageLevel: enrollment.coverageLevel,
    }));

    // Calculate annual employer benefits contribution
    const totalEmployerBenefits = benefitEnrollments.reduce((sum, enrollment) => {
      const freq = enrollment.paymentFrequency;
      const multiplier =
        freq === 'MONTHLY'
          ? 12
          : freq === 'BIWEEKLY'
            ? 26
            : freq === 'WEEKLY'
              ? 52
              : freq === 'QUARTERLY'
                ? 4
                : 1;
      return sum + enrollment.employerPremium * multiplier;
    }, 0);

    const totalEmployeeBenefits = benefitEnrollments.reduce((sum, enrollment) => {
      const freq = enrollment.paymentFrequency;
      const multiplier =
        freq === 'MONTHLY'
          ? 12
          : freq === 'BIWEEKLY'
            ? 26
            : freq === 'WEEKLY'
              ? 52
              : freq === 'QUARTERLY'
                ? 4
                : 1;
      return sum + enrollment.employeePremium * multiplier;
    }, 0);

    // Insurance from salary structure
    const medicalInsurance = salaryStructure
      ? Number(salaryStructure.medicalInsurance) * annualMultiplier
      : 0;
    const lifeInsurance = salaryStructure
      ? Number(salaryStructure.lifeInsurance) * annualMultiplier
      : 0;

    // Other allowances
    const otherAllowances = salaryStructure?.otherAllowances as Array<{
      code: string;
      name: string;
      amount: number;
    }> | null;
    const totalOtherAllowances =
      (otherAllowances || []).reduce((sum, a) => sum + (a.amount || 0), 0) * annualMultiplier;

    // Total compensation
    const totalCompensation =
      annualGrossSalary + totalEmployerBenefits + medicalInsurance + lifeInsurance;

    const compensationData = {
      employeeId,
      employeeCode: employee.employeeCode,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      year,
      baseSalary: {
        annual: annualBaseSalary,
        periodic: basicSalary,
        payFrequency,
        effectiveDate: salaryStructure?.effectiveFrom?.toISOString().split('T')[0] || null,
      },
      allowances: {
        houseRentAllowance: hra * annualMultiplier,
        transportAllowance: transportAllowance * annualMultiplier,
        otherAllowances: otherAllowances || [],
        totalOtherAllowances,
      },
      grossSalary: {
        annual: annualGrossSalary,
        periodic: grossSalary,
      },
      ctc: {
        annual: ctc * annualMultiplier,
        periodic: ctc,
      },
      benefitsValue: {
        total: totalEmployerBenefits,
        employeeContribution: totalEmployeeBenefits,
        breakdown: benefitsBreakdown,
      },
      insuranceFromSalary: {
        medicalInsurance,
        lifeInsurance,
      },
      total: {
        grossSalaryAnnual: annualGrossSalary,
        benefitsEmployerAnnual: totalEmployerBenefits,
        insuranceAnnual: medicalInsurance + lifeInsurance,
        totalCompensation,
      },
    };

    return NextResponse.json({
      success: true,
      data: compensationData,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[Total Compensation API] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to compute total compensation',
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
