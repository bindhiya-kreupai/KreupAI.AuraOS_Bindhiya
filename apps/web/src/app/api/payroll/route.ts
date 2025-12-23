/**
 * Payroll API Routes
 * Phase 2: Core Enhancement - Payroll Engine v2
 *
 * @swagger
 * /api/payroll:
 *   post:
 *     summary: Process payroll for a company
 *     tags: [Payroll]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenantId
 *               - companyId
 *               - month
 *               - countryCode
 *             properties:
 *               tenantId:
 *                 type: string
 *               companyId:
 *                 type: string
 *               month:
 *                 type: string
 *                 example: "2024-01"
 *               countryCode:
 *                 type: string
 *                 enum: [AE, SA, BH, QA, OM, KW, IN]
 *               employeeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Payroll processed successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */

import { NextRequest, NextResponse } from 'next/server';
import { PayrollService } from '@/lib/services/payroll';
import { SupportedCountryCode } from '@/lib/services/compliance/types';

/**
 * POST /api/payroll
 * Process payroll run
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.tenantId || !body.companyId || !body.month || !body.countryCode) {
      return NextResponse.json(
        {
          error: 'Missing required fields: tenantId, companyId, month, countryCode',
          errorAr: 'حقول مطلوبة مفقودة: معرف المستأجر، معرف الشركة، الشهر، رمز البلد',
        },
        { status: 400 }
      );
    }

    // Validate month format
    if (!/^\d{4}-\d{2}$/.test(body.month)) {
      return NextResponse.json(
        {
          error: 'Invalid month format. Use YYYY-MM',
          errorAr: 'صيغة الشهر غير صالحة. استخدم YYYY-MM',
        },
        { status: 400 }
      );
    }

    // Validate country code
    const validCountries: SupportedCountryCode[] = ['AE', 'SA', 'BH', 'QA', 'OM', 'KW', 'IN'];
    if (!validCountries.includes(body.countryCode)) {
      return NextResponse.json(
        {
          error: `Invalid country code. Supported: ${validCountries.join(', ')}`,
          errorAr: `رمز البلد غير صالح. المدعومة: ${validCountries.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const payrollRun = await PayrollService.processPayroll({
      tenantId: body.tenantId,
      companyId: body.companyId,
      month: body.month,
      countryCode: body.countryCode,
      employeeIds: body.employeeIds,
      includeVariables: body.includeVariables,
      processAttendance: body.processAttendance,
      processLeave: body.processLeave,
    });

    return NextResponse.json({
      success: true,
      data: payrollRun,
    });
  } catch (error) {
    console.error('Payroll processing error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process payroll',
        errorAr: 'فشل في معالجة الرواتب',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/payroll
 * Get payroll runs list
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const companyId = searchParams.get('companyId');
    const month = searchParams.get('month');
    const status = searchParams.get('status');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
        { status: 400 }
      );
    }

    // This would fetch from database
    // For now, return structure
    return NextResponse.json({
      success: true,
      data: {
        payrollRuns: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
        },
      },
    });
  } catch (error) {
    console.error('Payroll fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payroll runs', errorAr: 'فشل في جلب سجلات الرواتب' },
      { status: 500 }
    );
  }
}
