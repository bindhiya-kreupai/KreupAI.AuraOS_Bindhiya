/**
 * Bahrain SIO Portal Readiness API — EX-04
 * POST: Generate submission package and run readiness assessment
 * GET: Get reconciliation report
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { BahrainSIOPortalService } from '@/lib/services/compliance/bahrain-sio-portal.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, period, employees } = body;

    if (!tenantId || !period || !employees) {
      return NextResponse.json(
        {
          message: 'Missing required fields: tenantId, period, employees',
          messageAr: 'حقول مطلوبة مفقودة',
        },
        { status: 400 }
      );
    }

    // Generate submission package
    const submissionPackage = BahrainSIOPortalService.generateSubmissionPackage(
      tenantId,
      period,
      employees
    );

    // Run readiness assessment
    const readinessReport = BahrainSIOPortalService.runPortalReadinessAssessment(
      tenantId,
      submissionPackage
    );

    return NextResponse.json({
      success: true,
      data: { submissionPackage, readinessReport },
      message: `SIO portal readiness: ${readinessReport.overallReady ? 'READY' : 'NOT READY'}`,
      messageAr: `جاهزية بوابة التأمينات: ${readinessReport.overallReady ? 'جاهز' : 'غير جاهز'}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: 'Readiness assessment failed',
        messageAr: 'فشل تقييم الجاهزية',
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || new Date().toISOString().slice(0, 7);

    // Generate sample reconciliation (in production would fetch from DB)
    const reconciliation = BahrainSIOPortalService.generateReconciliationReport(
      period,
      [], // Expected contributions (from DB in production)
      [] // Actual contributions (from DB in production)
    );

    return NextResponse.json({
      success: true,
      data: reconciliation,
      message: `SIO reconciliation for ${period}: ${reconciliation.status}`,
      messageAr: `تسوية التأمينات لـ ${period}: ${reconciliation.status}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Reconciliation failed', messageAr: 'فشل التسوية', error: String(error) },
      { status: 500 }
    );
  }
}
