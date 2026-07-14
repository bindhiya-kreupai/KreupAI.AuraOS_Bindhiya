/**
 * HR Analytics Dashboard API Routes
 * Dashboard KPIs, headcount, turnover, attendance, payroll, leave, recruitment, compliance
 *
 * @swagger
 * /api/analytics/hr-dashboard:
 *   get:
 *     summary: Get HR analytics data (dashboard, headcount, turnover, etc.)
 *   post:
 *     summary: Drill-down analysis or export analytics
 *     tags: [Analytics - HR Dashboard]
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { HRAnalyticsEngineService } from '@/lib/services/analytics/hr-analytics-engine.service';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const DrillDownSchema = z.object({
  action: z.literal('drilldown'),
  metric: z.string().min(1),
  dimension: z.string().min(1),
  filters: z
    .object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      departmentId: z.string().optional(),
      countryCode: z.string().optional(),
    })
    .optional(),
});

const ExportSchema = z.object({
  action: z.literal('export'),
  format: z.enum(['pdf', 'excel', 'csv']),
  sections: z.array(z.string()).min(1),
  filters: z
    .object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      departmentId: z.string().optional(),
      countryCode: z.string().optional(),
    })
    .optional(),
});

// GET - Get HR analytics data
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.ANALYTICS, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'dashboard';
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    // Engine expects DateRange { start: Date, end: Date }, not { startDate, endDate }.
    // Only build a range if the caller actually provided both — otherwise pass undefined
    // and let the engine use its own default (last 12 months).
    const dateRange =
      startDateStr && endDateStr
        ? { start: new Date(startDateStr), end: new Date(endDateStr) }
        : undefined;

    switch (action) {
      case 'dashboard': {
        const data = await HRAnalyticsEngineService.getDashboardMetrics(user.tenantId, dateRange);
        return NextResponse.json({ success: true, data });
      }

      case 'headcount': {
        const data = await HRAnalyticsEngineService.getHeadcountAnalytics(user.tenantId, dateRange);
        return NextResponse.json({ success: true, data });
      }

      case 'turnover': {
        const data = await HRAnalyticsEngineService.getTurnoverAnalytics(user.tenantId, dateRange);
        return NextResponse.json({ success: true, data });
      }

      case 'attendance': {
        const data = await HRAnalyticsEngineService.getAttendanceAnalytics(
          user.tenantId,
          dateRange
        );
        return NextResponse.json({ success: true, data });
      }

      case 'payroll': {
        const data = await HRAnalyticsEngineService.getPayrollAnalytics(user.tenantId, dateRange);
        return NextResponse.json({ success: true, data });
      }

      case 'leave': {
        const data = await HRAnalyticsEngineService.getLeaveAnalytics(user.tenantId, dateRange);
        return NextResponse.json({ success: true, data });
      }

      case 'recruitment': {
        const data = await HRAnalyticsEngineService.getRecruitmentAnalytics(
          user.tenantId,
          dateRange
        );
        return NextResponse.json({ success: true, data });
      }

      case 'compliance': {
        const data = await HRAnalyticsEngineService.getComplianceScorecard(user.tenantId);
        return NextResponse.json({ success: true, data });
      }

      case 'executive': {
        const data = await HRAnalyticsEngineService.getExecutiveSummary(user.tenantId, dateRange);
        return NextResponse.json({ success: true, data });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}`, errorAr: `إجراء غير معروف: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    logger.error({ error }, 'Error fetching HR analytics');
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch HR analytics data',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
});

// POST - Drill-down analysis or export
export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.ANALYTICS, Action.READ, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'drilldown': {
        const data = DrillDownSchema.parse(body);
        const result = await HRAnalyticsEngineService.drillDown(user.tenantId, data.metric, {
          dimension: data.dimension,
          ...data.filters,
        } as any);
        return NextResponse.json({ success: true, data: result });
      }

      case 'export': {
        const data = ExportSchema.parse(body);
        const result = await HRAnalyticsEngineService.exportAnalyticsReport(
          user.tenantId,
          data.sections,
          data.format as any
        );
        return NextResponse.json({ success: true, data: result });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}`, errorAr: `إجراء غير معروف: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error({ error }, 'Error in HR analytics operation');
    return NextResponse.json(
      { success: false, error: 'Failed to process HR analytics request' },
      { status: 500 }
    );
  }
});
