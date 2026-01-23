import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const department = searchParams.get('department');
  const period = searchParams.get('period') || 'current';

  const peopleAnalytics = {
    workforce: {
      totalEmployees: 1024,
      activeEmployees: 987,
      onLeave: 37,
      averageTenure: 2.8,
      averageAge: 34.2,
      newHiresThisMonth: 18,
      separationsThisMonth: 6,
      netGrowth: 12,
      growthRate: 1.2,
      openPositions: 42,
      timeToFill: 34,
    },
    demographics: {
      gender: [
        { category: 'Male', count: 543, percentage: 55 },
        { category: 'Female', count: 420, percentage: 43 },
        { category: 'Non-binary', count: 24, percentage: 2 },
      ],
      ageDistribution: [
        { range: '18-25', count: 98, percentage: 10 },
        { range: '26-35', count: 412, percentage: 42 },
        { range: '36-45', count: 298, percentage: 30 },
        { range: '46-55', count: 142, percentage: 14 },
        { range: '55+', count: 37, percentage: 4 },
      ],
      tenureDistribution: [
        { range: '<1 year', count: 215, percentage: 22 },
        { range: '1-2 years', count: 287, percentage: 29 },
        { range: '2-5 years', count: 312, percentage: 32 },
        { range: '5-10 years', count: 125, percentage: 13 },
        { range: '10+ years', count: 48, percentage: 4 },
      ],
    },
    departmentBreakdown: [
      { department: 'Engineering', headcount: 342, avgTenure: 2.5, avgSalary: 145000, turnoverRate: 12.5, engagementScore: 7.6, openRoles: 15 },
      { department: 'Sales', headcount: 215, avgTenure: 2.1, avgSalary: 118000, turnoverRate: 18.6, engagementScore: 7.2, openRoles: 8 },
      { department: 'Marketing', headcount: 128, avgTenure: 3.2, avgSalary: 108000, turnoverRate: 11.7, engagementScore: 7.9, openRoles: 5 },
      { department: 'Product', headcount: 95, avgTenure: 2.5, avgSalary: 140000, turnoverRate: 10.2, engagementScore: 8.1, openRoles: 6 },
      { department: 'Finance', headcount: 104, avgTenure: 4.1, avgSalary: 125000, turnoverRate: 8.6, engagementScore: 7.5, openRoles: 3 },
      { department: 'HR', headcount: 62, avgTenure: 3.8, avgSalary: 98000, turnoverRate: 7.2, engagementScore: 8.3, openRoles: 2 },
      { department: 'Operations', headcount: 41, avgTenure: 3.5, avgSalary: 92000, turnoverRate: 9.1, engagementScore: 7.4, openRoles: 3 },
    ],
    engagement: {
      overallScore: 7.8,
      responseRate: 82,
      enps: 42,
      trend: [
        { quarter: 'Q1 2025', score: 7.2, responseRate: 78 },
        { quarter: 'Q2 2025', score: 7.5, responseRate: 80 },
        { quarter: 'Q3 2025', score: 7.6, responseRate: 81 },
        { quarter: 'Q4 2025', score: 7.8, responseRate: 82 },
      ],
      topDrivers: ['Career Growth', 'Work-Life Balance', 'Team Collaboration', 'Manager Quality'],
      areasOfConcern: ['Compensation Competitiveness', 'Learning Opportunities', 'Recognition'],
    },
    performance: {
      averageRating: 3.7,
      reviewCompletionRate: 94,
      highPerformers: 148,
      solidPerformers: 690,
      lowPerformers: 49,
      ratingDistribution: [
        { rating: 'Exceptional', count: 79, percentage: 8 },
        { rating: 'Exceeds Expectations', count: 217, percentage: 22 },
        { rating: 'Meets Expectations', count: 493, percentage: 50 },
        { rating: 'Needs Improvement', count: 148, percentage: 15 },
        { rating: 'Unsatisfactory', count: 50, percentage: 5 },
      ],
    },
    retention: {
      overallRetentionRate: 87.5,
      voluntaryTurnoverRate: 10.2,
      involuntaryTurnoverRate: 2.3,
      avgTimeToTermination: 18.5,
      retentionByTenure: [
        { tenure: '<1 year', retentionRate: 78 },
        { tenure: '1-2 years', retentionRate: 85 },
        { tenure: '2-5 years', retentionRate: 92 },
        { tenure: '5+ years', retentionRate: 96 },
      ],
      topExitReasons: [
        { reason: 'Better opportunity', percentage: 35 },
        { reason: 'Compensation', percentage: 22 },
        { reason: 'Career growth', percentage: 18 },
        { reason: 'Work-life balance', percentage: 12 },
        { reason: 'Relocation', percentage: 8 },
        { reason: 'Other', percentage: 5 },
      ],
    },
    costMetrics: {
      avgCostPerHire: 4800,
      avgCostPerTermination: 15200,
      trainingInvestmentPerEmployee: 2400,
      revenuePerEmployee: 285000,
      laborCostAsPercentOfRevenue: 42,
    },
    riskIndicators: {
      attritionRisk: { high: 79, medium: 148, low: 760 },
      criticalRolesAtRisk: 12,
      successionCoverage: 68,
      burnoutRisk: 15,
      complianceIssues: 3,
    },
    generatedAt: new Date().toISOString(),
    period,
    filters: { department },
  };

  return NextResponse.json({ success: true, data: peopleAnalytics });
}
