/**
 * Attrition Prediction API Routes
 * Phase 3: Intelligence Layer - Predictive Analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { AttritionPredictionService } from '@/lib/services/ai';

/**
 * POST /api/ai/attrition
 * Predict attrition risk for employee(s)
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

        const prediction = await AttritionPredictionService.predictAttritionRisk(
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
            AttritionPredictionService.predictAttritionRisk(emp)
          )
        );

        return NextResponse.json({
          success: true,
          data: {
            predictions,
            summary: {
              total: predictions.length,
              highRisk: predictions.filter((p: any) => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL').length,
              mediumRisk: predictions.filter((p: any) => p.riskLevel === 'MEDIUM').length,
              lowRisk: predictions.filter((p: any) => p.riskLevel === 'LOW').length,
            },
          },
        });

      case 'analytics':
        // Get department/organization analytics
        if (!body.employees || !Array.isArray(body.employees)) {
          return NextResponse.json(
            { error: 'employees array is required', errorAr: 'مصفوفة الموظفين مطلوبة' },
            { status: 400 }
          );
        }

        const analytics = await AttritionPredictionService.getAttritionAnalytics(
          body.tenantId,
          body.employees,
          body.options
        );

        return NextResponse.json({
          success: true,
          data: analytics,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action', errorAr: 'إجراء غير صالح' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Attrition prediction error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to predict attrition',
        errorAr: 'فشل في التنبؤ بمغادرة الموظفين',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/attrition
 * Get attrition analytics summary
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');
    const departmentId = searchParams.get('departmentId');
    const riskLevel = searchParams.get('riskLevel');

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required', errorAr: 'معرف المستأجر مطلوب' },
        { status: 400 }
      );
    }

    // In production, fetch from database
    // For now, return mock summary
    return NextResponse.json({
      success: true,
      data: {
        tenantId,
        asOfDate: new Date(),
        summary: {
          totalEmployees: 0,
          atRiskCount: 0,
          atRiskPercentage: 0,
          byRiskLevel: {
            CRITICAL: 0,
            HIGH: 0,
            MEDIUM: 0,
            LOW: 0,
          },
        },
        filters: {
          departmentId,
          riskLevel,
        },
      },
    });
  } catch (error) {
    console.error('Attrition fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attrition data', errorAr: 'فشل في جلب بيانات المغادرة' },
      { status: 500 }
    );
  }
}
