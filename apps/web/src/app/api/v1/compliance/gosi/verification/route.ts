/**
 * GOSI Law-Change Verification API — EX-02
 * POST: Run full verification suite
 * GET: Get approved rate card
 */

import { NextResponse } from 'next/server';
import { GOSIVerificationService } from '@/lib/services/compliance/gosi-verification.service';

export async function POST() {
  try {
    const result = GOSIVerificationService.runVerification();

    return NextResponse.json({
      success: true,
      data: result,
      message: `GOSI verification ${result.overallPass ? 'PASSED' : 'FAILED'}: ${result.testCases.filter((t) => t.passed).length}/${result.testCases.length} tests passed`,
      messageAr: `تحقق التأمينات الاجتماعية ${result.overallPass ? 'ناجح' : 'فاشل'}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Verification failed', messageAr: 'فشل التحقق', error: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const rateCard = GOSIVerificationService.generateApprovedRateCard();
    const regression = GOSIVerificationService.runRegressionSuite();

    return NextResponse.json({
      success: true,
      data: { rateCard, regression },
      message: 'GOSI rate card and regression results retrieved',
      messageAr: 'تم استرجاع بطاقة أسعار التأمينات ونتائج الاختبار',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: 'Failed to retrieve rate card',
        messageAr: 'فشل استرجاع بطاقة الأسعار',
        error: String(error),
      },
      { status: 500 }
    );
  }
}
