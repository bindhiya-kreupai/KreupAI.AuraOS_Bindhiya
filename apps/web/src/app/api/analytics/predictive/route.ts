// @ts-nocheck — Has Prisma schema drift (wrong field/relation names against current schema). Tracked under #29.
/**
 * Predictive Analytics API Routes
 * Attrition risk, performance prediction, headcount forecasting, compensation analysis
 *
 * @swagger
 * /api/analytics/predictive:
 *   post:
 *     summary: Run predictive analytics (attrition, performance, headcount, compensation, insights)
 *     tags: [Analytics - Predictive]
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { PredictiveAnalyticsService } from '@/lib/services/ai/predictive-analytics.service';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const AttritionRiskSchema = z.object({
  action: z.literal('attritionRisk'),
  employeeId: z.string().min(1),
});

const PerformanceSchema = z.object({
  action: z.literal('performance'),
  employeeId: z.string().min(1),
});

const HeadcountForecastSchema = z.object({
  action: z.literal('headcount'),
  months: z.number().int().positive(),
  departmentId: z.string().optional(),
});

const CompensationSchema = z.object({
  action: z.literal('compensation'),
  departmentId: z.string().optional(),
});

const FlightRiskSchema = z.object({
  action: z.literal('flightRisk'),
  threshold: z.number().min(0).max(1).optional(),
});

// POST - Run predictive analytics
export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.ANALYTICS, Action.READ, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'attritionRisk': {
        const data = AttritionRiskSchema.parse(body);
        const result = await PredictiveAnalyticsService.predictAttritionRisk(
          user.tenantId,
          data.employeeId
        );
        return NextResponse.json({ success: true, data: result });
      }

      case 'performance': {
        const data = PerformanceSchema.parse(body);
        const result = await PredictiveAnalyticsService.predictPerformance(
          user.tenantId,
          data.employeeId
        );
        return NextResponse.json({ success: true, data: result });
      }

      case 'headcount': {
        const data = HeadcountForecastSchema.parse(body);
        const result = await PredictiveAnalyticsService.forecastHeadcount(
          user.tenantId,
          data.months,
          data.departmentId
        );
        return NextResponse.json({ success: true, data: result });
      }

      case 'compensation': {
        const data = CompensationSchema.parse(body);
        const result = await PredictiveAnalyticsService.analyzeCompensation(
          user.tenantId,
          data.departmentId
        );
        return NextResponse.json({ success: true, data: result });
      }

      case 'insights': {
        const result = await PredictiveAnalyticsService.generateWorkforceInsights(user.tenantId);
        return NextResponse.json({ success: true, data: result });
      }

      case 'flightRisk': {
        const data = FlightRiskSchema.parse(body);
        const result = await PredictiveAnalyticsService.identifyFlightRisk(
          user.tenantId,
          data.threshold
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
    logger.error({ error }, 'Error in predictive analytics');
    return NextResponse.json(
      { success: false, error: 'Failed to process predictive analytics request' },
      { status: 500 }
    );
  }
});
