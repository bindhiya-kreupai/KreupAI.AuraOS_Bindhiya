/**
 * Dashboard API Routes
 * Phase 3: Intelligence Layer - Analytics Dashboards
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { DashboardService } from '@/lib/services/reporting';

/**
 * POST /api/dashboard
 * Create or update dashboards
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
        { status: 400 }
      );
    }

    const action = body.action || 'create-default';

    switch (action) {
      case 'create-default':
        // Create default dashboard
        const defaultDashboard = await DashboardService.createDefaultDashboard(
          body.tenantId,
          body.createdBy || 'system'
        );

        return NextResponse.json({
          success: true,
          data: defaultDashboard,
        });

      case 'save':
        // Save dashboard configuration
        // In production, save to database
        return NextResponse.json({
          success: true,
          data: {
            id: body.dashboard?.id || `dash_${Date.now()}`,
            message: 'Dashboard saved successfully',
            messageAr: 'تم حفظ لوحة المعلومات بنجاح',
          },
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action', errorAr: 'إجراء غير صالح' },
          { status: 400 }
        );
    }
  } catch (error) {
        return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process dashboard',
        errorAr: 'فشل في معالجة لوحة المعلومات',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/dashboard
 * Get dashboard data or configurations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const type = searchParams.get('type') || 'metrics'; // 'metrics' | 'config' | 'periods'
    const module = searchParams.get('module') || 'hr'; // 'hr' | 'payroll' | 'attendance' | 'leave' | 'recruitment'
    const metric = searchParams.get('metric');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
        { status: 400 }
      );
    }

    // Get periods
    const periods = DashboardService.getAnalyticsPeriods();
    const currentPeriod = periods.find(p => p.label === 'This Month') || periods[2];

    switch (type) {
      case 'metrics':
        let metrics;

        switch (module) {
          case 'payroll':
            metrics = await DashboardService.getPayrollMetrics(tenantId, currentPeriod);
            break;
          case 'attendance':
            metrics = await DashboardService.getAttendanceMetrics(tenantId, currentPeriod);
            break;
          case 'leave':
            metrics = await DashboardService.getLeaveMetrics(tenantId, currentPeriod);
            break;
          case 'recruitment':
            metrics = await DashboardService.getRecruitmentMetrics(tenantId, currentPeriod);
            break;
          case 'hr':
          default:
            metrics = await DashboardService.getHRMetrics(tenantId, currentPeriod);
        }

        return NextResponse.json({
          success: true,
          data: {
            metrics,
            period: currentPeriod,
          },
        });

      case 'breakdown':
        if (!metric) {
          return NextResponse.json(
            { error: 'metric is required for breakdown', errorAr: 'المقياس مطلوب للتفصيل' },
            { status: 400 }
          );
        }

        const breakdown = await DashboardService.getDepartmentBreakdown(
          tenantId,
          metric as 'headcount' | 'payroll' | 'attendance' | 'attrition'
        );

        return NextResponse.json({
          success: true,
          data: breakdown,
        });

      case 'trend':
        const period = searchParams.get('period') as 'week' | 'month' | 'quarter' | 'year' || 'month';
        const trendData = await DashboardService.getTrendData(
          tenantId,
          metric || 'headcount',
          period
        );

        return NextResponse.json({
          success: true,
          data: trendData,
        });

      case 'periods':
        return NextResponse.json({
          success: true,
          data: periods,
        });

      case 'config':
        // Return dashboard configuration
        // In production, fetch from database
        const defaultDashboard = await DashboardService.createDefaultDashboard(
          tenantId,
          'system'
        );

        return NextResponse.json({
          success: true,
          data: defaultDashboard,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid type', errorAr: 'نوع غير صالح' },
          { status: 400 }
        );
    }
  } catch (error) {
        return NextResponse.json(
      { error: 'Failed to fetch dashboard data', errorAr: 'فشل في جلب بيانات لوحة المعلومات' },
      { status: 500 }
    );
  }
}
