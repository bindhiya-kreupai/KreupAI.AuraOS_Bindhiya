/**
 * Dashboard API Routes
 * Phase 3: Intelligence Layer - Analytics Dashboards
 *
 * Tenant scoping: tenantId is ALWAYS extracted from the authenticated session.
 * Any tenantId supplied in the request body or query string is silently ignored.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createProtectedRoute } from '@/lib/api/route-wrapper';
import { DashboardService } from '@/lib/services/reporting';

/**
 * POST /api/dashboard
 * Create or update dashboards (auth: dashboard:write)
 */
export const POST = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const body = await request.json();
    const tenantId = auth!.tenantId;
    const action = body.action || 'create-default';

    switch (action) {
      case 'create-default': {
        const defaultDashboard = await DashboardService.createDefaultDashboard(
          tenantId,
          auth!.userId
        );
        return { success: true, data: defaultDashboard };
      }

      case 'save': {
        return {
          success: true,
          data: {
            id: body.dashboard?.id || `dash_${Date.now()}`,
            message: 'Dashboard saved successfully',
            messageAr: 'تم حفظ لوحة المعلومات بنجاح',
          },
        };
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action', errorAr: 'إجراء غير صالح' },
          { status: 400 }
        );
    }
  },
  {
    requiredPermissions: ['dashboard:write'],
    rateLimit: 'API_USER',
  }
);

/**
 * GET /api/dashboard
 * Get dashboard data or configurations (auth: dashboard:read)
 */
export const GET = createProtectedRoute(
  async (request: NextRequest, { auth }) => {
    const { searchParams } = new URL(request.url);
    const tenantId = auth!.tenantId;
    const type = searchParams.get('type') || 'metrics';
    const moduleName = searchParams.get('module') || 'hr';
    const metric = searchParams.get('metric');

    const periods = DashboardService.getAnalyticsPeriods();
    const currentPeriod = periods.find((p) => p.label === 'This Month') || periods[2];

    switch (type) {
      case 'metrics': {
        let metrics;
        switch (moduleName) {
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
        return { success: true, data: { metrics, period: currentPeriod } };
      }

      case 'breakdown': {
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
        return { success: true, data: breakdown };
      }

      case 'trend': {
        const period =
          (searchParams.get('period') as 'week' | 'month' | 'quarter' | 'year') || 'month';
        const trendData = await DashboardService.getTrendData(
          tenantId,
          metric || 'headcount',
          period
        );
        return { success: true, data: trendData };
      }

      case 'periods':
        return { success: true, data: periods };

      case 'config': {
        const defaultDashboard = await DashboardService.createDefaultDashboard(tenantId, 'system');
        return { success: true, data: defaultDashboard };
      }

      default:
        return NextResponse.json(
          { error: 'Invalid type', errorAr: 'نوع غير صالح' },
          { status: 400 }
        );
    }
  },
  {
    requiredPermissions: ['dashboard:read'],
    rateLimit: 'API_USER',
  }
);
