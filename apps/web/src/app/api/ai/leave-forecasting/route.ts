/**
 * Leave Forecasting API
 * GET  — dashboard / peak-periods / recommendations (session tenant)
 * POST — action: recompute | forecast
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  canReadAiAutomation,
  canWriteAiAutomation,
  resolveAiAutomationAuth,
} from '@/lib/ai/ai-automation-auth';
import { getLeaveForecastDashboard } from '@/lib/ai/leave-forecasting-ai';

export async function GET(request: NextRequest) {
  try {
    const auth = await resolveAiAutomationAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized', errorAr: 'غير مصرح' }, { status: 401 });
    }
    if (!canReadAiAutomation(auth.permissions, auth.roles)) {
      return NextResponse.json({ error: 'Forbidden', errorAr: 'محظور' }, { status: 403 });
    }

    const view = new URL(request.url).searchParams.get('view') || 'forecast';
    const data = await getLeaveForecastDashboard(auth.tenantId, {
      userId: auth.userId,
      persist: view === 'forecast',
    });

    if (view === 'peak-periods') {
      return NextResponse.json({
        success: true,
        data: { peakPeriods: data.peakPeriods },
      });
    }
    if (view === 'recommendations') {
      return NextResponse.json({
        success: true,
        data: { recommendations: data.recommendations },
      });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[leave-forecasting GET]', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch leave forecast',
        errorAr: 'فشل في جلب توقعات الإجازات',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await resolveAiAutomationAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized', errorAr: 'غير مصرح' }, { status: 401 });
    }
    if (!canWriteAiAutomation(auth.permissions, auth.roles)) {
      return NextResponse.json({ error: 'Forbidden', errorAr: 'محظور' }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const action = String(body.action || 'recompute');
    if (action !== 'recompute' && action !== 'forecast') {
      return NextResponse.json(
        { error: 'Invalid action', errorAr: 'إجراء غير صالح' },
        { status: 400 }
      );
    }

    const data = await getLeaveForecastDashboard(auth.tenantId, {
      userId: auth.userId,
      persist: true,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('[leave-forecasting POST]', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to recompute leave forecast',
        errorAr: 'فشل في إعادة حساب توقعات الإجازات',
      },
      { status: 500 }
    );
  }
}
