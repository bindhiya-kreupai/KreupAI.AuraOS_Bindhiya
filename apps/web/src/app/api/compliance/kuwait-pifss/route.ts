/**
 * Kuwait PIFSS (Public Institution for Social Security) API Routes
 *
 * @swagger
 * /api/compliance/kuwait-pifss:
 *   post:
 *     summary: Calculate Kuwait PIFSS contributions
 *     tags: [Compliance - Kuwait PIFSS]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employees
 *               - month
 *             properties:
 *               employees:
 *                 type: array
 *                 items:
 *                   type: object
 *               month:
 *                 type: string
 *                 example: "2024-01"
 *     responses:
 *       200:
 *         description: PIFSS contributions calculated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { KuwaitPIFSSService } from '@/lib/services/compliance';
import type { KuwaitPIFSSEmployee } from '@/lib/services/compliance/types';

/**
 * POST /api/compliance/kuwait-pifss
 * Calculate PIFSS contributions for employees
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.employees || !Array.isArray(body.employees)) {
      return NextResponse.json(
        {
          error: 'Missing or invalid employees array',
          errorAr: 'مصفوفة الموظفين مفقودة أو غير صالحة'
        },
        { status: 400 }
      );
    }

    const employees: KuwaitPIFSSEmployee[] = body.employees;
    const month: string = body.month || new Date().toISOString().slice(0, 7);

    // Calculate contributions for all employees
    const results = employees.map(employee => {
      const contribution = KuwaitPIFSSService.calculateContribution(employee);
      return {
        employeeId: employee.employeeId,
        employeeName: employee.employeeName,
        nationality: employee.nationality,
        sector: employee.sector,
        basicSalary: employee.basicSalary,
        socialAllowance: employee.socialAllowance,
        contributorySalary: contribution.contributorySalary,
        contribution,
      };
    });

    // Calculate totals
    const totals = results.reduce(
      (acc, result) => ({
        totalEmployeeContribution: acc.totalEmployeeContribution + result.contribution.employeeShare,
        totalEmployerContribution: acc.totalEmployerContribution + result.contribution.employerShare,
        totalContribution: acc.totalContribution + result.contribution.totalContribution,
      }),
      { totalEmployeeContribution: 0, totalEmployerContribution: 0, totalContribution: 0 }
    );

    return NextResponse.json({
      success: true,
      data: {
        month,
        results,
        totals,
        summary: {
          totalEmployees: employees.length,
          kuwaitiNationals: employees.filter(e => e.nationality === 'KW').length,
          gccNationals: employees.filter(e => e.nationality !== 'KW' && ['SA', 'AE', 'BH', 'OM', 'QA'].includes(e.nationality)).length,
          nonGccNationals: employees.filter(e => !['KW', 'SA', 'AE', 'BH', 'OM', 'QA'].includes(e.nationality)).length,
          privateSector: employees.filter(e => e.sector === 'PRIVATE').length,
          governmentSector: employees.filter(e => e.sector === 'GOVERNMENT').length,
        },
      },
    });
  } catch (error) {
        return NextResponse.json(
      { error: 'Failed to calculate PIFSS contributions', errorAr: 'فشل في حساب مساهمات المؤسسة العامة للتأمينات الاجتماعية' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/compliance/kuwait-pifss
 * Get Kuwait PIFSS reference data (rates, limits)
 */
export async function GET() {
  try {
    const rates = KuwaitPIFSSService.getContributionRates();
    const limits = KuwaitPIFSSService.getSalaryLimits();

    return NextResponse.json({
      success: true,
      data: {
        rates,
        limits,
        schemes: [
          {
            id: 'pension',
            name: 'Old Age Pension',
            nameAr: 'معاش الشيخوخة',
            description: 'Retirement pension for aged employees',
          },
          {
            id: 'disability',
            name: 'Disability Pension',
            nameAr: 'معاش العجز',
            description: 'Benefits for permanently disabled employees',
          },
          {
            id: 'death',
            name: 'Death Benefits',
            nameAr: 'تعويضات الوفاة',
            description: 'Benefits for dependents of deceased employees',
          },
          {
            id: 'occupational_hazards',
            name: 'Occupational Hazards',
            nameAr: 'مخاطر المهنة',
            description: 'Work-related injury and disease coverage',
          },
        ],
      },
    });
  } catch (error) {
        return NextResponse.json(
      { error: 'Failed to fetch PIFSS reference data', errorAr: 'فشل في جلب البيانات المرجعية' },
      { status: 500 }
    );
  }
}
