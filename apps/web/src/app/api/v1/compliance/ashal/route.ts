/**
 * Kuwait AS'HAL Integration API — EX-06
 * POST: Submit work permit application
 * GET: Poll permit status
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { KuwaitASHALService } from '@/lib/services/compliance/kuwait-ashal.service';
import type { ASHALConfiguration } from '@/lib/services/compliance/kuwait-ashal.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenantId, employeeId, config, payload } = body;

    if (!tenantId || !employeeId || !config || !payload) {
      return NextResponse.json(
        {
          message: 'Missing required fields: tenantId, employeeId, config, payload',
          messageAr: 'حقول مطلوبة مفقودة',
        },
        { status: 400 }
      );
    }

    const ashal = KuwaitASHALService.create(config as ASHALConfiguration);
    const submission = await ashal.submitPermit(tenantId, employeeId, payload);

    return NextResponse.json({
      success: true,
      data: submission,
      message: `AS'HAL permit submitted: ${submission.status}`,
      messageAr: `تم تقديم تصريح أسهل: ${submission.status}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error.message || "AS'HAL submission failed",
        messageAr: 'فشل تقديم أسهل',
        error: String(error),
      },
      { status: 500 }
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

    const config = JSON.parse(configJson) as ASHALConfiguration;
    const ashal = KuwaitASHALService.create(config);
    const result = await ashal.pollStatus(referenceNumber);

    return NextResponse.json({
      success: true,
      data: result,
      message: `AS'HAL permit ${referenceNumber}: ${result.status}`,
      messageAr: `تصريح أسهل ${referenceNumber}: ${result.status}`,
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
