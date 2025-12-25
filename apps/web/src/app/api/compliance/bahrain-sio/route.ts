/**
 * Bahrain SIO (Social Insurance Organisation) API Routes
 *
 * @swagger
 * /api/compliance/bahrain-sio:
 *   post:
 *     summary: Calculate Bahrain SIO contributions
 *     tags: [Compliance - Bahrain SIO]
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
 *         description: SIO contributions calculated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { BahrainSIOService } from '@/lib/services/compliance';
import type { BahrainSIOEmployee } from '@/lib/services/compliance/types';

/**
 * POST /api/compliance/bahrain-sio
 * Calculate SIO contributions for employees
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

    const employees: BahrainSIOEmployee[] = body.employees;
    const month: string = body.month || new Date().toISOString().slice(0, 7);

    // Calculate contributions for all employees
    const results = employees.map(employee => {
      const contribution = BahrainSIOService.calculateContribution(employee);
      return {
        employeeId: employee.employeeId,
        employeeName: employee.employeeName,
        nationality: employee.nationality,
        basicSalary: employee.basicSalary,
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
          bahrainNationals: employees.filter(e => e.nationality === 'BH').length,
          gccNationals: employees.filter(e => e.nationality !== 'BH' && ['SA', 'AE', 'OM', 'KW', 'QA'].includes(e.nationality)).length,
          nonGccNationals: employees.filter(e => !['BH', 'SA', 'AE', 'OM', 'KW', 'QA'].includes(e.nationality)).length,
        },
      },
    });
  } catch {
        return NextResponse.json(
      { error: 'Failed to calculate SIO contributions', errorAr: 'فشل في حساب مساهمات التأمينات الاجتماعية' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/compliance/bahrain-sio
 * Get Bahrain SIO reference data (rates, limits)
 */
export async function GET() {
  try {
    const rates = BahrainSIOService.getContributionRates();
    const limits = BahrainSIOService.getSalaryLimits();

    return NextResponse.json({
      success: true,
      data: {
        rates,
        limits,
        schemes: [
          {
            id: 'pension',
            name: 'Pension Insurance',
            nameAr: 'تأمين المعاشات التقاعدية',
            description: 'Old age, disability, and death benefits',
          },
          {
            id: 'unemployment',
            name: 'Unemployment Insurance',
            nameAr: 'تأمين التعطل',
            description: 'Unemployment benefits for Bahraini nationals',
          },
          {
            id: 'workplace_injury',
            name: 'Workplace Injury Insurance',
            nameAr: 'تأمين إصابات العمل',
            description: 'Work-related injury and occupational disease coverage',
          },
        ],
      },
    });
  } catch {
        return NextResponse.json(
      { error: 'Failed to fetch SIO reference data', errorAr: 'فشل في جلب البيانات المرجعية' },
      { status: 500 }
    );
  }
}
