/**
 * Workforce Analytics API Routes
 * Phase 3: Intelligence Layer - Workforce Planning
 */

import { NextRequest, NextResponse } from 'next/server';
import { WorkforceAnalyticsService } from '@/lib/services/ai';

/**
 * POST /api/ai/workforce
 * Perform workforce analytics
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

    const action = body.action || 'forecast';

    switch (action) {
      case 'forecast':
        // Generate headcount forecast
        if (!body.data) {
          return NextResponse.json(
            { error: 'workforce data is required', errorAr: 'بيانات القوى العاملة مطلوبة' },
            { status: 400 }
          );
        }

        const forecast = await WorkforceAnalyticsService.forecastHeadcount(
          body.data,
          body.months || 12
        );

        return NextResponse.json({
          success: true,
          data: forecast,
        });

      case 'skills-gap':
        // Perform skills gap analysis
        if (!body.data) {
          return NextResponse.json(
            { error: 'workforce data is required', errorAr: 'بيانات القوى العاملة مطلوبة' },
            { status: 400 }
          );
        }

        const skillsGap = await WorkforceAnalyticsService.analyzeSkillsGap(body.data);

        return NextResponse.json({
          success: true,
          data: skillsGap,
        });

      case 'succession':
        // Analyze succession planning
        if (!body.data) {
          return NextResponse.json(
            { error: 'workforce data is required', errorAr: 'بيانات القوى العاملة مطلوبة' },
            { status: 400 }
          );
        }

        const succession = await WorkforceAnalyticsService.analyzeSuccession(body.data);

        return NextResponse.json({
          success: true,
          data: succession,
        });

      case 'diversity':
        // Analyze diversity metrics
        if (!body.data) {
          return NextResponse.json(
            { error: 'workforce data is required', errorAr: 'بيانات القوى العاملة مطلوبة' },
            { status: 400 }
          );
        }

        const diversity = await WorkforceAnalyticsService.analyzeDiversity(body.data);

        return NextResponse.json({
          success: true,
          data: diversity,
        });

      case 'comprehensive':
        // Run all analytics
        if (!body.data) {
          return NextResponse.json(
            { error: 'workforce data is required', errorAr: 'بيانات القوى العاملة مطلوبة' },
            { status: 400 }
          );
        }

        const [
          comprehensiveForecast,
          comprehensiveSkillsGap,
          comprehensiveSuccession,
          comprehensiveDiversity,
        ] = await Promise.all([
          WorkforceAnalyticsService.forecastHeadcount(body.data, body.months || 12),
          WorkforceAnalyticsService.analyzeSkillsGap(body.data),
          WorkforceAnalyticsService.analyzeSuccession(body.data),
          WorkforceAnalyticsService.analyzeDiversity(body.data),
        ]);

        return NextResponse.json({
          success: true,
          data: {
            headcountForecast: comprehensiveForecast,
            skillsGapAnalysis: comprehensiveSkillsGap,
            successionPlanning: comprehensiveSuccession,
            diversityMetrics: comprehensiveDiversity,
            generatedAt: new Date(),
          },
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action', errorAr: 'إجراء غير صالح' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Workforce analytics error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to analyze workforce',
        errorAr: 'فشل في تحليل القوى العاملة',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/workforce
 * Get workforce analytics summary
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const type = searchParams.get('type') || 'summary';

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
        { status: 400 }
      );
    }

    // In production, fetch from database
    return NextResponse.json({
      success: true,
      data: {
        tenantId,
        type,
        summary: {
          currentHeadcount: 0,
          projectedHeadcount: 0,
          skillsGapScore: 0,
          successionReadiness: 0,
          diversityScore: 0,
        },
        lastAnalyzedAt: null,
      },
    });
  } catch (error) {
    console.error('Workforce fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workforce data', errorAr: 'فشل في جلب بيانات القوى العاملة' },
      { status: 500 }
    );
  }
}
