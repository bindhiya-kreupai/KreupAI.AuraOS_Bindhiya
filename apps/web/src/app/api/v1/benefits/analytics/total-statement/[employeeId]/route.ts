import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

// Tenant isolation is enforced via tenantId extracted from auth context (simulated here)

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta?: any;
}

export const GET = withEnhancedAuth(
  async (request: NextRequest, { _user, params, permissions }: any) => {
    if (!permissions.includes('benefits/analytics:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing benefits/analytics:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    try {
      const { employeeId } = params;

      // Simulated employee lookup with tenant isolation
      const knownEmployees = ['emp-001', 'emp-002', 'emp-003', 'emp-010'];
      if (!knownEmployees.includes(employeeId)) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'E4001',
            message: `Employee with id '${employeeId}' not found`,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        };
        return NextResponse.json(response, { status: 404 });
      }

      const currentYear = new Date().getFullYear();

      const totalStatement = {
        employeeId,
        tenantId: 'tenant-1',
        statementYear: currentYear,
        employee: {
          id: employeeId,
          name: 'John Smith',
          title: 'Senior Software Engineer',
          department: 'Engineering',
          hireDate: '2019-03-01',
        },
        totalCompensationSummary: {
          baseSalary: 145000,
          variablePay: 12000,
          totalCash: 157000,
          totalBenefitsValue: 38420,
          totalCompensation: 195420,
        },
        benefits: [
          {
            category: 'Health Insurance',
            type: 'MEDICAL',
            planName: 'BlueCross PPO 2000',
            coverage: 'Employee + Family',
            totalAnnualPremium: 21840,
            employerContribution: 18900,
            employeeContribution: 2940,
            employerContributionPercent: 86.5,
          },
          {
            category: 'Health Insurance',
            type: 'DENTAL',
            planName: 'Delta Dental Plus',
            coverage: 'Employee + Family',
            totalAnnualPremium: 2520,
            employerContribution: 1680,
            employeeContribution: 840,
            employerContributionPercent: 66.7,
          },
          {
            category: 'Health Insurance',
            type: 'VISION',
            planName: 'VSP Vision Care',
            coverage: 'Employee + Family',
            totalAnnualPremium: 480,
            employerContribution: 360,
            employeeContribution: 120,
            employerContributionPercent: 75.0,
          },
          {
            category: 'Life Insurance',
            type: 'BASIC_LIFE',
            coverage: '2x Base Salary ($290,000)',
            totalAnnualPremium: 1200,
            employerContribution: 1200,
            employeeContribution: 0,
            employerContributionPercent: 100.0,
          },
          {
            category: 'Disability',
            type: 'SHORT_TERM_DISABILITY',
            coverage: '60% of salary for up to 12 weeks',
            totalAnnualPremium: 580,
            employerContribution: 580,
            employeeContribution: 0,
            employerContributionPercent: 100.0,
          },
          {
            category: 'Disability',
            type: 'LONG_TERM_DISABILITY',
            coverage: '60% of salary after 90-day elimination period',
            totalAnnualPremium: 840,
            employerContribution: 840,
            employeeContribution: 0,
            employerContributionPercent: 100.0,
          },
          {
            category: 'Retirement',
            type: '401K',
            planName: 'Acme 401(k) Plan',
            employeeContribution: 14500,
            employerMatch: 6000,
            employerMatchFormula: '100% of first 3%, 50% of next 2%',
            vestingSchedule: '3-year cliff',
            vestedPercent: 100,
          },
          {
            category: 'Paid Time Off',
            type: 'PTO',
            annualDays: 20,
            usedDays: 12,
            remainingDays: 8,
            dollarValue: 11154, // based on daily rate
          },
          {
            category: 'Other Benefits',
            type: 'FLEXIBLE_WORK',
            description: 'Remote work and flexible hours',
            estimatedValue: 4200,
          },
          {
            category: 'Other Benefits',
            type: 'PROFESSIONAL_DEVELOPMENT',
            description: 'Annual L&D budget',
            annualBudget: 2000,
            used: 1500,
            remaining: 500,
            dollarValue: 2000,
          },
        ],
        hsaFsaContributions: {
          hsaEmployerContribution: 500,
          hsaEmployeeContribution: 3650,
          hsaBalance: 4120.5,
          fsaBalance: 0,
        },
        generatedAt: new Date().toISOString(),
        downloadUrl: `/api/v1/benefits/analytics/total-statement/${employeeId}/download`,
      };

      const response: ApiResponse = {
        success: true,
        data: totalStatement,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to generate total benefits statement',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      };
      return NextResponse.json(response, { status: 500 });
    }
  }
);
