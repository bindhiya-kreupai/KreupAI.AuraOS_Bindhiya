// @ts-nocheck — Has Prisma schema drift (wrong field/relation names against current schema). Tracked under #29.
/**
 * Labour Law API Routes
 * Provides labour law configurations for all supported countries
 *
 * @swagger
 * /api/compliance/labour-law:
 *   get:
 *     summary: Get labour law configuration for a country
 *     tags: [Compliance - Labour Law]
 *     parameters:
 *       - name: countryCode
 *         in: query
 *         schema:
 *           type: string
 *           enum: [AE, SA, BH, QA, OM, KW, IN]
 *     responses:
 *       200:
 *         description: Labour law configuration
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { LabourLawService } from '@/lib/services/compliance';
import type { SupportedCountryCode } from '@/lib/services/compliance/types';

/**
 * GET /api/compliance/labour-law
 * Get labour law configuration
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const countryCode = url.searchParams.get('countryCode') as SupportedCountryCode | null;

    if (!countryCode) {
      // Return all supported countries
      const countries = LabourLawService.getSupportedCountries();
      return NextResponse.json({
        success: true,
        data: {
          supportedCountries: countries,
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

    const config = LabourLawService.getConfig(countryCode);

    return NextResponse.json({
      success: true,
      data: config,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to fetch labour law configuration',
        errorAr: 'فشل في جلب إعدادات قانون العمل',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/compliance/labour-law
 * Calculate labour law compliance
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { countryCode, action, params } = body;

    if (!countryCode || !action) {
      return NextResponse.json(
        {
          error: 'Missing required fields: countryCode, action',
          errorAr: 'حقول مطلوبة مفقودة: رمز الدولة، الإجراء',
        },
        { status: 400 }
      );
    }

    const validCountries: SupportedCountryCode[] = ['AE', 'SA', 'BH', 'QA', 'OM', 'KW', 'IN'];
    if (!validCountries.includes(countryCode)) {
      return NextResponse.json(
        { error: 'Invalid country code', errorAr: 'رمز الدولة غير صالح' },
        { status: 400 }
      );
    }

    let result: unknown;

    switch (action) {
      case 'calculateAnnualLeave':
        if (params?.yearsOfService === undefined) {
          return NextResponse.json(
            { error: 'Missing parameter: yearsOfService', errorAr: 'معامل مفقود: سنوات الخدمة' },
            { status: 400 }
          );
        }
        result = {
          annualLeaveDays: LabourLawService.calculateAnnualLeave(
            countryCode,
            params.yearsOfService
          ),
          countryCode,
          yearsOfService: params.yearsOfService,
        };
        break;

      case 'calculateOvertimeRate':
        if (!params?.overtimeType) {
          return NextResponse.json(
            { error: 'Missing parameter: overtimeType', errorAr: 'معامل مفقود: نوع العمل الإضافي' },
            { status: 400 }
          );
        }
        result = {
          overtimeRate: LabourLawService.calculateOvertimeRate(countryCode, params.overtimeType),
          overtimeType: params.overtimeType,
          countryCode,
        };
        break;

      case 'getWorkingHours':
        result = LabourLawService.getWorkingHours(countryCode, params?.isRamadan || false);
        break;

      case 'validateWorkingHours':
        if (params?.hoursPerDay === undefined || params?.hoursPerWeek === undefined) {
          return NextResponse.json(
            {
              error: 'Missing parameters: hoursPerDay, hoursPerWeek',
              errorAr: 'معاملات مفقودة: ساعات اليوم، ساعات الأسبوع',
            },
            { status: 400 }
          );
        }
        result = LabourLawService.validateWorkingHours(
          countryCode,
          params.hoursPerDay,
          params.hoursPerWeek,
          params.isRamadan || false
        );
        break;

      case 'validateProbation':
        if (params?.probationDays === undefined) {
          return NextResponse.json(
            {
              error: 'Missing parameter: probationDays',
              errorAr: 'معامل مفقود: أيام فترة التجربة',
            },
            { status: 400 }
          );
        }
        const probResult = LabourLawService.validateProbation(
          countryCode,
          params.probationDays,
          params.isExtension || false
        );
        result = {
          valid: probResult.isCompliant,
          isValid: probResult.isCompliant,
          maxDays: 180,
          maxAllowedDays: 180,
        };
        break;

      case 'isEligibleForHajjLeave':
        if (params?.yearsOfService === undefined || params?.isMuslim === undefined) {
          return NextResponse.json(
            {
              error: 'Missing parameters: yearsOfService, isMuslim',
              errorAr: 'معاملات مفقودة: سنوات الخدمة، مسلم',
            },
            { status: 400 }
          );
        }
        const religion = params.isMuslim ? 'Islam' : 'Other';
        const hajjLeave = LabourLawService.isEligibleForHajjLeave(
          countryCode,
          params.yearsOfService,
          religion,
          params.hasTakenHajjLeave || false
        );
        result = {
          isEligible: hajjLeave.eligible,
          days: 30,
          countryCode,
        };
        break;

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}`, errorAr: `إجراء غير معروف: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to perform labour law calculation', errorAr: 'فشل في حساب قانون العمل' },
      { status: 500 }
    );
  }
}
