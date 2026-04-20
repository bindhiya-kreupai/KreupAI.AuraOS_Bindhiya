/**
 * KSA Qiwa Contract Integration API — EX-05
 * POST: Submit employment contract
 * GET: Poll contract status
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { QiwaService } from '@/lib/services/compliance/qiwa.service';
import type {
  QiwaConfiguration,
  QiwaContractPayload,
} from '@/lib/services/compliance/qiwa.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, employeeId, config, contract } = body;

    if (!tenantId || !employeeId || !config || !contract) {
      return NextResponse.json(
        {
          message: 'Missing required fields: tenantId, employeeId, config, contract',
          messageAr: 'حقول مطلوبة مفقودة',
        },
        { status: 400 }
      );
    }

    const qiwa = QiwaService.create(config as QiwaConfiguration);

    // Validate contract first
    const validationErrors = qiwa.validateContractPayload(contract as QiwaContractPayload);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Contract validation failed',
          messageAr: 'فشل التحقق من صحة العقد',
          errors: validationErrors,
        },
        { status: 422 }
      );
    }

    const submission = await qiwa.submitContract(tenantId, employeeId, contract);

    return NextResponse.json({
      success: true,
      data: submission,
      message: `Contract submitted to Qiwa: ${submission.status}`,
      messageAr: `تم إرسال العقد إلى قوى: ${submission.status}`,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return NextResponse.json(
      {
        message: error.message || 'Qiwa submission failed',
        messageAr: 'فشل الإرسال إلى قوى',
        error: String(error),
      },
      { status: statusCode }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const referenceNumber = searchParams.get('reference');
    const configJson = searchParams.get('config');

    if (!referenceNumber || !configJson) {
      return NextResponse.json(
        {
          message: 'Missing required params: reference, config',
          messageAr: 'معلمات مطلوبة مفقودة',
        },
        { status: 400 }
      );
    }

    const config = JSON.parse(configJson) as QiwaConfiguration;
    const qiwa = QiwaService.create(config);
    const result = await qiwa.pollContractStatus(referenceNumber);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Contract ${referenceNumber}: ${result.currentStatus}`,
      messageAr: `العقد ${referenceNumber}: ${result.currentStatus}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error.message || 'Status polling failed',
        messageAr: 'فشل استطلاع الحالة',
        error: String(error),
      },
      { status: 500 }
    );
  }
}
