/**
 * EOSB (End of Service Benefits) API Routes
 *
 * @swagger
 * /api/compliance/eosb:
 *   post:
 *     summary: Calculate End of Service Benefits / Gratuity
 *     tags: [Compliance - EOSB]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - employeeId
 *               - countryCode
 *               - joiningDate
 *               - lastWorkingDate
 *               - basicSalary
 *               - terminationType
 *             properties:
 *               employeeId:
 *                 type: string
 *               countryCode:
 *                 type: string
 *                 enum: [AE, SA, BH, QA, OM, KW, IN]
 *               joiningDate:
 *                 type: string
 *                 format: date
 *               lastWorkingDate:
 *                 type: string
 *                 format: date
 *               basicSalary:
 *                 type: number
 *               totalSalary:
 *                 type: number
 *               terminationType:
 *                 type: string
 *                 enum: [RESIGNATION, TERMINATION, TERMINATION_WITHOUT_CAUSE, END_OF_CONTRACT, RETIREMENT, DEATH, DISABILITY, MUTUAL_AGREEMENT]
 *               contractType:
 *                 type: string
 *                 enum: [FIXED, INDEFINITE]
 *     responses:
 *       200:
 *         description: EOSB calculation result
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { EOSBService } from '@/lib/services/compliance';
import type { EOSBCalculationInput, SupportedCountryCode } from '@/lib/services/compliance/types';

/**
 * POST /api/compliance/eosb
 * Calculate End of Service Benefits
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['employeeId', 'countryCode', 'joiningDate', 'lastWorkingDate', 'basicSalary', 'terminationType'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}`, errorAr: `حقل مطلوب مفقود: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate country code
    const validCountries: SupportedCountryCode[] = ['AE', 'SA', 'BH', 'QA', 'OM', 'KW', 'IN'];
    if (!validCountries.includes(body.countryCode)) {
      return NextResponse.json(
        { error: 'Invalid country code', errorAr: 'رمز الدولة غير صالح' },
        { status: 400 }
      );
    }

    const input: EOSBCalculationInput = {
      employeeId: body.employeeId,
      countryCode: body.countryCode,
      joiningDate: new Date(body.joiningDate),
      lastWorkingDate: new Date(body.lastWorkingDate),
      basicSalary: parseFloat(body.basicSalary),
      totalSalary: body.totalSalary ? parseFloat(body.totalSalary) : undefined,
      terminationType: body.terminationType,
      contractType: body.contractType,
    };

    const result = EOSBService.calculate(input);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch {
        return NextResponse.json(
      { error: 'Failed to calculate EOSB', errorAr: 'فشل في حساب مكافأة نهاية الخدمة' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/compliance/eosb
 * Get EOSB rules for a country
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const countryCode = url.searchParams.get('countryCode') as SupportedCountryCode;

    if (!countryCode) {
      // Return supported countries
      return NextResponse.json({
        success: true,
        data: {
          supportedCountries: ['AE', 'SA', 'BH', 'QA', 'OM', 'KW', 'IN'],
          terminationTypes: [
            'RESIGNATION',
            'TERMINATION',
            'TERMINATION_WITHOUT_CAUSE',
            'END_OF_CONTRACT',
            'RETIREMENT',
            'DEATH',
            'DISABILITY',
            'MUTUAL_AGREEMENT',
          ],
        },
      });
    }

    const validCountries: SupportedCountryCode[] = ['AE', 'SA', 'BH', 'QA', 'OM', 'KW', 'IN'];
    if (!validCountries.includes(countryCode)) {
      return NextResponse.json(
        { error: 'Invalid country code', errorAr: 'رمز الدولة غير صالح' },
        { status: 400 }
      );
    }

    // Get labour law config for EOSB rules
    const { LabourLawService } = await import('@/lib/services/compliance');
    const config = LabourLawService.getConfig(countryCode);

    return NextResponse.json({
      success: true,
      data: {
        countryCode,
        eosb: config.eosb,
        currency: config.currency,
      },
    });
  } catch {
        return NextResponse.json(
      { error: 'Failed to fetch EOSB rules', errorAr: 'فشل في جلب قواعد مكافأة نهاية الخدمة' },
      { status: 500 }
    );
  }
}
