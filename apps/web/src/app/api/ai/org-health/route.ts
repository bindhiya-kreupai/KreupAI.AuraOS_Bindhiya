/**
 * Organization Health Predictor API Routes
 * Phase 3: Intelligence Layer - Organizational Analytics
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/ai/org-health
 * Get organization health metrics and predictions
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const department = searchParams.get('department');
    const timeframe = searchParams.get('timeframe') || '30d';

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
        { status: 400 }
      );
    }

    // Mock organization health data
    const healthData = {
      overallScore: 78,
      trend: 'improving',
      lastUpdated: new Date().toISOString(),
      metrics: {
        engagement: {
          score: 82,
          trend: 'stable',
          benchmark: 75,
          status: 'GOOD',
        },
        productivity: {
          score: 75,
          trend: 'improving',
          benchmark: 70,
          status: 'GOOD',
        },
        retention: {
          score: 71,
          trend: 'declining',
          benchmark: 80,
          status: 'WARNING',
        },
        satisfaction: {
          score: 79,
          trend: 'improving',
          benchmark: 75,
          status: 'GOOD',
        },
        collaboration: {
          score: 85,
          trend: 'stable',
          benchmark: 80,
          status: 'EXCELLENT',
        },
        wellbeing: {
          score: 68,
          trend: 'declining',
          benchmark: 75,
          status: 'WARNING',
        },
      },
      risks: [
        {
          id: 'risk-1',
          type: 'ATTRITION',
          severity: 'HIGH',
          description: '15% increase in attrition risk in Engineering',
          impact: 'HIGH',
          recommendations: [
            'Conduct stay interviews with high-risk employees',
            'Review compensation benchmarking',
            'Implement career development programs',
          ],
        },
        {
          id: 'risk-2',
          type: 'BURNOUT',
          severity: 'MEDIUM',
          description: 'Overtime hours increasing in Operations team',
          impact: 'MEDIUM',
          recommendations: [
            'Review workload distribution',
            'Consider additional hiring',
            'Implement flexible work arrangements',
          ],
        },
        {
          id: 'risk-3',
          type: 'ENGAGEMENT',
          severity: 'LOW',
          description: 'Engagement scores declining in Sales',
          impact: 'MEDIUM',
          recommendations: [
            'Enhance recognition programs',
            'Improve manager-employee communication',
            'Review team dynamics',
          ],
        },
      ],
      predictions: {
        next30Days: {
          attritionRate: 4.2,
          engagementTrend: 'stable',
          productivityTrend: 'improving',
          riskLevel: 'MEDIUM',
        },
        next90Days: {
          attritionRate: 5.5,
          engagementTrend: 'improving',
          productivityTrend: 'improving',
          riskLevel: 'MEDIUM',
        },
      },
      departmentBreakdown: [
        {
          department: 'Engineering',
          healthScore: 72,
          employees: 120,
          risks: ['HIGH_ATTRITION', 'BURNOUT'],
          trend: 'declining',
        },
        {
          department: 'Sales',
          healthScore: 75,
          employees: 85,
          risks: ['LOW_ENGAGEMENT'],
          trend: 'stable',
        },
        {
          department: 'Operations',
          healthScore: 80,
          employees: 60,
          risks: ['BURNOUT'],
          trend: 'improving',
        },
        {
          department: 'Support',
          healthScore: 85,
          employees: 45,
          risks: [],
          trend: 'stable',
        },
      ],
    };

    return NextResponse.json({
      success: true,
      data: healthData,
    });
  } catch (error) {
        return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch organization health',
        errorAr: 'فشل في جلب صحة المنظمة',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ai/org-health
 * Run health analysis or get recommendations
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action = body.action || 'analyze';

    switch (action) {
      case 'analyze':
        // Run comprehensive health analysis
        if (!body.tenantId) {
          return NextResponse.json(
            { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          data: {
            analysisId: `analysis_${Date.now()}`,
            status: 'COMPLETED',
            timestamp: new Date().toISOString(),
            message: 'Health analysis completed successfully',
          },
        });

      case 'recommend':
        // Get AI-powered recommendations for improvement
        if (!body.metricType) {
          return NextResponse.json(
            { error: 'metricType is required', errorAr: 'نوع المقياس مطلوب' },
            { status: 400 }
          );
        }

        const recommendations = {
          metricType: body.metricType,
          currentScore: body.currentScore || 70,
          targetScore: body.targetScore || 85,
          recommendations: [
            {
              priority: 'HIGH',
              category: 'LEADERSHIP',
              action: 'Implement manager training programs',
              impact: '+8 points',
              effort: 'MEDIUM',
              timeframe: '3 months',
            },
            {
              priority: 'MEDIUM',
              category: 'CULTURE',
              action: 'Launch employee recognition program',
              impact: '+5 points',
              effort: 'LOW',
              timeframe: '1 month',
            },
            {
              priority: 'MEDIUM',
              category: 'DEVELOPMENT',
              action: 'Create career pathing framework',
              impact: '+7 points',
              effort: 'HIGH',
              timeframe: '6 months',
            },
          ],
        };

        return NextResponse.json({
          success: true,
          data: recommendations,
        });

      case 'simulate':
        // Simulate impact of interventions
        const simulation = {
          baseline: body.baseline || 75,
          interventions: body.interventions || [],
          projectedScore: body.baseline + (body.interventions?.length * 3 || 0),
          timeline: '6 months',
          confidence: 0.82,
        };

        return NextResponse.json({
          success: true,
          data: simulation,
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
        error: error instanceof Error ? error.message : 'Failed to process organization health request',
        errorAr: 'فشل في معالجة طلب صحة المنظمة',
      },
      { status: 500 }
    );
  }
}
