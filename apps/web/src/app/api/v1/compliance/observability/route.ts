/**
 * Compliance Observability API — EX-07
 * GET: Get observability dashboard and drillbook
 * POST: Record metric or check alerts
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ComplianceObservabilityService } from '@/lib/services/compliance/compliance-observability.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'dashboard';

    if (view === 'drillbook') {
      const drillbook = ComplianceObservabilityService.generateFailureDrillbook();
      return NextResponse.json({
        success: true,
        data: { drillbook },
        message: 'Failure drillbook retrieved',
        messageAr: 'تم استرجاع دليل الأعطال',
      });
    }

    if (view === 'thresholds') {
      const thresholds = ComplianceObservabilityService.getDefaultAlertThresholds();
      return NextResponse.json({
        success: true,
        data: { thresholds, count: thresholds.length },
        message: 'Alert thresholds retrieved',
        messageAr: 'تم استرجاع عتبات التنبيه',
      });
    }

    // Default: dashboard
    const dashboard = ComplianceObservabilityService.generateDashboard([], [], []);
    return NextResponse.json({
      success: true,
      data: dashboard,
      message: `Compliance observability: ${dashboard.overallHealth}`,
      messageAr: `مراقبة الامتثال: ${dashboard.overallHealth}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: 'Failed to load observability data',
        messageAr: 'فشل تحميل بيانات المراقبة',
        error: String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, regulatorId, metricType, value, tenantId, tags } = body;

    if (action === 'record_metric') {
      if (!regulatorId || !metricType || value === undefined || !tenantId) {
        return NextResponse.json(
          {
            message: 'Missing fields for metric recording',
            messageAr: 'حقول مفقودة لتسجيل المقياس',
          },
          { status: 400 }
        );
      }

      const metric = ComplianceObservabilityService.recordMetric(
        regulatorId,
        metricType,
        value,
        tenantId,
        tags || {}
      );

      return NextResponse.json({
        success: true,
        data: metric,
        message: `Metric recorded: ${regulatorId}/${metricType} = ${value}`,
        messageAr: `تم تسجيل المقياس`,
      });
    }

    if (action === 'check_alert') {
      const { threshold, currentValue } = body;
      if (!threshold || currentValue === undefined) {
        return NextResponse.json(
          {
            message: 'Missing threshold or currentValue',
            messageAr: 'العتبة أو القيمة الحالية مفقودة',
          },
          { status: 400 }
        );
      }

      const alert = ComplianceObservabilityService.evaluateAlert(threshold, currentValue);
      return NextResponse.json({
        success: true,
        data: { alert, triggered: !!alert },
        message: alert ? `Alert triggered: ${alert.severity}` : 'No alert triggered',
        messageAr: alert ? `تم تشغيل التنبيه: ${alert.severity}` : 'لم يتم تشغيل أي تنبيه',
      });
    }

    return NextResponse.json(
      { message: 'Unknown action. Use: record_metric, check_alert', messageAr: 'إجراء غير معروف' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        message: 'Observability action failed',
        messageAr: 'فشل إجراء المراقبة',
        error: String(error),
      },
      { status: 500 }
    );
  }
}
