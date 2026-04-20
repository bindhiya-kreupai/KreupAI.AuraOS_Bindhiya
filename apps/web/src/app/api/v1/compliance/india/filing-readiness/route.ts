/**
 * India Statutory Filing Readiness API — EX-03
 * POST: Run E2E filing validation
 * GET: Get filing calendar
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { IndiaFilingReadinessService } from '@/lib/services/compliance/india-filing-readiness.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, filingType, period, employeeData } = body;

    if (!tenantId || !filingType || !period) {
      return NextResponse.json(
        {
          message: 'Missing required fields: tenantId, filingType, period',
          messageAr: 'حقول مطلوبة مفقودة',
        },
        { status: 400 }
      );
    }

    const validation = IndiaFilingReadinessService.runE2EValidation(
      tenantId,
      filingType,
      period,
      employeeData || []
    );

    return NextResponse.json({
      success: true,
      data: validation,
      message: `E2E validation ${validation.overallPassed ? 'PASSED' : 'FAILED'} for ${filingType} period ${period}`,
      messageAr: `التحقق الشامل ${validation.overallPassed ? 'ناجح' : 'فاشل'}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Filing validation failed',
        messageAr: 'فشل التحقق من الإيداع',
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const financialYear = searchParams.get('fy') || '2025-2026';

    const calendar = IndiaFilingReadinessService.generateFilingCalendar(financialYear);

    return NextResponse.json({
      success: true,
      data: { calendar, financialYear },
      message: `Filing calendar for FY ${financialYear}`,
      messageAr: `تقويم الإيداع للسنة المالية ${financialYear}`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: 'Failed to generate calendar',
        messageAr: 'فشل إنشاء التقويم',
        error: String(error),
      },
      { status: 500 }
    );
  }
}
