import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const predictions = [
      {
        predictionId: `attrition-${Date.now()}`,
        employeeId: 'emp-001',
        employeeName: 'John Doe',
        department: 'Engineering',
        position: 'Senior Developer',
        attritionRisk: 'low',
        attritionProbability: 15,
        predictedTimeframe: '12_months',
        confidenceLevel: 'high',
        riskFactors: [],
        topRiskFactors: [],
        employeeMetrics: {
          tenure: 48,
          performanceRating: 4.2,
          engagementScore: 85,
          satisfactionScore: 88,
          lastPromotionMonths: 18,
          compensationPercentile: 75,
          workloadScore: 70,
          managerRelationshipScore: 90
        },
        retentionStrategies: [],
        similarCases: 25,
        actualAttritionRate: 12,
        lastUpdated: new Date().toISOString(),
        nextReviewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        alertsEnabled: true,
        predictionDate: new Date().toISOString(),
        modelVersion: 'v2.0.0'
      }
    ];

    return NextResponse.json({ predictions }, { status: 200 });
  } catch (error) {
    console.error('Error fetching attrition predictions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
