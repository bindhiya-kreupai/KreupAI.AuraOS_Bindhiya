/**
 * Oman SPF (Social Protection Fund) API Routes
 *
 * @swagger
 * /api/compliance/oman-spf:
 *   post:
 *     summary: Calculate Oman SPF contributions
 *     tags: [Compliance - Oman SPF]
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
 *         description: SPF contributions calculated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */

import { NextRequest, NextResponse } from 'next/server';
import { OmanSPFService } from '@/lib/services/compliance';
import { OmanSPFEmployee } from '@/lib/services/compliance/types';

/**
 * POST /api/compliance/oman-spf
 * Calculate SPF contributions for employees
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

    const employees: OmanSPFEmployee[] = body.employees;
    const month: string = body.month || new Date().toISOString().slice(0, 7);

    // Calculate contributions for all employees
    const results = employees.map(employee => {
      const contribution = OmanSPFService.calculateContribution(employee);
      return {
        employeeId: employee.employeeId,
        employeeName: employee.employeeName,
        nationality: employee.nationality,
        basicSalary: employee.basicSalary,
        housingAllowance: employee.housingAllowance,
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
          omaniNationals: employees.filter(e => e.nationality === 'OM').length,
          gccNationals: employees.filter(e => e.nationality !== 'OM' && ['SA', 'AE', 'BH', 'KW', 'QA'].includes(e.nationality)).length,
          nonGccNationals: employees.filter(e => !['OM', 'SA', 'AE', 'BH', 'KW', 'QA'].includes(e.nationality)).length,
        },
      },
    });
  } catch (error) {
    console.error('Oman SPF calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate SPF contributions', errorAr: 'فشل في حساب مساهمات صندوق الحماية الاجتماعية' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/compliance/oman-spf
 * Get Oman SPF reference data (rates, limits)
 */
export async function GET() {
  try {
    const rates = OmanSPFService.getContributionRates();
    const limits = OmanSPFService.getSalaryLimits();

    return NextResponse.json({
      success: true,
      data: {
        rates,
        limits,
        legislation: {
          name: 'Royal Decree No. 52/2023',
          nameAr: 'المرسوم السلطاني رقم 52/2023',
          effectiveDate: '2024-01-01',
          description: 'Social Protection Fund Law',
        },
        schemes: [
          {
            id: 'pension',
            name: 'Pension Scheme',
            nameAr: 'نظام المعاشات',
            description: 'Old age, disability, and death benefits',
          },
          {
            id: 'unemployment',
            name: 'Unemployment Insurance',
            nameAr: 'تأمين التعطل',
            description: 'Unemployment benefits for Omani nationals',
          },
        ],
      },
    });
  } catch (error) {
    console.error('Oman SPF reference data error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SPF reference data', errorAr: 'فشل في جلب البيانات المرجعية' },
      { status: 500 }
    );
  }
}
