import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const predictiveData = {
    generatedAt: '2026-01-23T00:00:00Z',
    modelVersion: '2.4.1',
    confidence: 0.87,
    attritionRisk: {
      highRisk: {
        count: 34,
        percentage: 2.7,
        employees: [
          {
            id: 'emp-112',
            department: 'Engineering',
            tenure: '1.5 years',
            riskScore: 0.89,
            factors: ['below market pay', 'low engagement score', 'manager change'],
            recommendedActions: ['compensation review', 'career development discussion'],
          },
          {
            id: 'emp-245',
            department: 'Sales',
            tenure: '2.1 years',
            riskScore: 0.85,
            factors: ['missed promotion', 'declining performance', 'team conflict'],
            recommendedActions: ['1:1 with skip-level manager', 'role realignment'],
          },
          {
            id: 'emp-378',
            department: 'Product',
            tenure: '0.8 years',
            riskScore: 0.82,
            factors: ['poor onboarding experience', 'role mismatch', 'remote isolation'],
            recommendedActions: ['mentorship pairing', 'role clarification meeting'],
          },
        ],
      },
      mediumRisk: { count: 89, percentage: 7.1 },
      lowRisk: { count: 1124, percentage: 90.1 },
      predictedTurnoverNext90Days: 22,
      potentialCostImpact: 990000,
    },
    engagementForecast: {
      currentScore: 7.4,
      predictedNextQuarter: 7.6,
      trend: 'improving',
      drivers: [
        { factor: 'Career development opportunities', impact: 0.82, trend: 'positive' },
        { factor: 'Manager relationship', impact: 0.78, trend: 'stable' },
        { factor: 'Work-life balance', impact: 0.75, trend: 'positive' },
        { factor: 'Compensation satisfaction', impact: 0.68, trend: 'negative' },
        { factor: 'Company direction clarity', impact: 0.65, trend: 'stable' },
      ],
      atRiskTeams: [
        { team: 'Platform Engineering', score: 5.8, trend: 'declining', headcount: 28 },
        { team: 'Inside Sales', score: 6.1, trend: 'declining', headcount: 35 },
      ],
    },
    hiringForecast: {
      predictedOpeningsNext6Months: 85,
      byDepartment: [
        { department: 'Engineering', predicted: 32, reason: 'Growth + backfill' },
        { department: 'Sales', predicted: 22, reason: 'Revenue targets expansion' },
        { department: 'Product', predicted: 12, reason: 'New product line' },
        { department: 'Operations', predicted: 10, reason: 'Scaling support' },
        { department: 'Other', predicted: 9, reason: 'Backfill + growth' },
      ],
      estimatedTimeToFill: 42,
      estimatedCostToHire: 12500,
    },
    performanceInsights: {
      topPerformersAtRisk: 8,
      promotionReadiness: { ready: 45, developing: 112, notReady: 890 },
      skillGapsTrending: ['AI/ML', 'Cloud Architecture', 'Data Engineering', 'Product Analytics'],
    },
  };

  return NextResponse.json({ success: true, data: predictiveData });
}
