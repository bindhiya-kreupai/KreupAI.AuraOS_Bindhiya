/**
 * WPS Certification Readiness API — EX-01
 * POST: Run certification assessment
 * GET: Get bank UAT checklist
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { WPSCertificationService } from '@/lib/services/compliance/wps-certification.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, config, records, payrollMonth } = body;

    if (!tenantId || !config || !records || !payrollMonth) {
      return NextResponse.json(
        {
          message: 'Missing required fields: tenantId, config, records, payrollMonth',
          messageAr: 'حقول مطلوبة مفقودة',
        },
        { status: 400 }
      );
    }

    const report = await WPSCertificationService.runCertificationAssessment(
      tenantId,
      config,
      records,
      payrollMonth
    );

    return NextResponse.json({
      success: true,
      data: report,
      message: `Certification assessment complete: ${report.overallStatus}`,
      messageAr: `اكتمل تقييم الشهادة: ${report.overallStatus}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: 'Certification assessment failed',
        messageAr: 'فشل تقييم الشهادة',
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const checklist = WPSCertificationService.generateBankUATChecklist();

    return NextResponse.json({
      success: true,
      data: { checklist },
      message: 'Bank UAT checklist retrieved',
      messageAr: 'تم استرجاع قائمة مراجعة اختبار قبول البنك',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: 'Failed to retrieve checklist',
        messageAr: 'فشل استرجاع القائمة',
        error: String(error),
      },
      { status: 500 }
    );
  }
}
