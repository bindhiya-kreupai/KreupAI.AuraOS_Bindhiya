/**
 * Performance Prediction API Routes
 * Phase 3: Intelligence Layer - Predictive Analytics
 */

import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { PerformancePredictionService } from '@/lib/services/ai';

/**
 * POST /api/ai/performance
 * Predict performance for employee(s)
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

    const action = body.action || 'predict';

    switch (action) {
      case 'predict':
        // Predict for single employee
        if (!body.employeeData) {
          return NextResponse.json(
            { error: 'employeeData is required', errorAr: 'بيانات الموظف مطلوبة' },
            { status: 400 }
          );
        }

        const prediction = await PerformancePredictionService.predictPerformance(
          body.employeeData
        );

        return NextResponse.json({
          success: true,
          data: prediction,
        });

      case 'batch':
        // Predict for multiple employees
        if (!body.employees || !Array.isArray(body.employees)) {
          return NextResponse.json(
            { error: 'employees array is required', errorAr: 'مصفوفة الموظفين مطلوبة' },
            { status: 400 }
          );
        }

        const predictions = await Promise.all(
          body.employees.map((emp: any) =>
            PerformancePredictionService.predictPerformance(emp)
          )
        );

        return NextResponse.json({
          success: true,
          data: {
            predictions,
            summary: {
              total: predictions.length,
              averageScore: Math.round(
                predictions.reduce((sum: number, p: any) => sum + p.predictedScore, 0) / predictions.length
              ),
              improving: predictions.filter((p: any) => p.trend === 'IMPROVING').length,
              declining: predictions.filter((p: any) => p.trend === 'DECLINING').length,
            },
          },
        });

      case 'goal-prediction':
        // Predict goal completion
        if (!body.goal) {
          return NextResponse.json(
            { error: 'goal data is required', errorAr: 'بيانات الهدف مطلوبة' },
            { status: 400 }
          );
        }

        const goalPrediction = await PerformancePredictionService.predictGoalCompletion(
          body.goal
        );

        return NextResponse.json({
          success: true,
          data: goalPrediction,
        });

      case 'team-insights':
        // Get team performance insights
        if (!body.teamData || !Array.isArray(body.teamData)) {
          return NextResponse.json(
            { error: 'teamData array is required', errorAr: 'بيانات الفريق مطلوبة' },
            { status: 400 }
          );
        }

        const insights = await PerformancePredictionService.getTeamInsights(
          body.teamData
        );

        return NextResponse.json({
          success: true,
          data: insights,
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
        error: error instanceof Error ? error.message : 'Failed to predict performance',
        errorAr: 'فشل في التنبؤ بالأداء',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/performance
 * Get performance predictions summary
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const employeeId = searchParams.get('employeeId');
    const departmentId = searchParams.get('departmentId');

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
        asOfDate: new Date(),
        summary: {
          totalEmployees: 0,
          averagePredictedScore: 0,
          distribution: {
            EXCEPTIONAL: 0,
            EXCEEDS: 0,
            MEETS: 0,
            DEVELOPING: 0,
            NEEDS_IMPROVEMENT: 0,
          },
        },
        filters: {
          employeeId,
          departmentId,
        },
      },
    });
  } catch (error) {
        return NextResponse.json(
      { error: 'Failed to fetch performance data', errorAr: 'فشل في جلب بيانات الأداء' },
      { status: 500 }
    );
  }
}
