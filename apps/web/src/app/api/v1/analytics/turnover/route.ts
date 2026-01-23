import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '12months';

  const turnoverData = {
    period,
    generatedAt: '2026-01-23T00:00:00Z',
    overall: {
      turnoverRate: 14.2,
      voluntaryRate: 10.1,
      involuntaryRate: 4.1,
      industryBenchmark: 15.5,
      trend: 'improving',
    },
    byDepartment: [
      { department: 'Engineering', rate: 12.5, voluntary: 9.8, involuntary: 2.7, benchmark: 13.2 },
      { department: 'Sales', rate: 18.6, voluntary: 15.2, involuntary: 3.4, benchmark: 20.0 },
      { department: 'Marketing', rate: 11.7, voluntary: 9.0, involuntary: 2.7, benchmark: 14.0 },
      { department: 'Customer Success', rate: 16.2, voluntary: 12.5, involuntary: 3.7, benchmark: 18.0 },
      { department: 'Finance', rate: 8.6, voluntary: 6.2, involuntary: 2.4, benchmark: 10.0 },
      { department: 'Operations', rate: 13.4, voluntary: 9.5, involuntary: 3.9, benchmark: 15.0 },
    ],
    reasons: [
      { reason: 'Better compensation elsewhere', count: 34, percentage: 27.2 },
      { reason: 'Career growth opportunities', count: 28, percentage: 22.4 },
      { reason: 'Work-life balance', count: 22, percentage: 17.6 },
      { reason: 'Management issues', count: 15, percentage: 12.0 },
      { reason: 'Relocation', count: 12, percentage: 9.6 },
      { reason: 'Company culture', count: 8, percentage: 6.4 },
      { reason: 'Other', count: 6, percentage: 4.8 },
    ],
    byTenure: [
      { range: '0-6 months', rate: 22.5, count: 18 },
      { range: '6-12 months', rate: 18.3, count: 22 },
      { range: '1-2 years', rate: 15.1, count: 31 },
      { range: '2-5 years', rate: 10.2, count: 28 },
      { range: '5+ years', rate: 6.8, count: 14 },
    ],
    monthlyTrend: [
      { month: '2025-07', rate: 15.8, separations: 16 },
      { month: '2025-08', rate: 15.2, separations: 15 },
      { month: '2025-09', rate: 14.9, separations: 14 },
      { month: '2025-10', rate: 14.6, separations: 15 },
      { month: '2025-11', rate: 14.5, separations: 17 },
      { month: '2025-12', rate: 14.3, separations: 13 },
      { month: '2026-01', rate: 14.2, separations: 11 },
    ],
    costOfTurnover: {
      averageCostPerEmployee: 45000,
      totalCostYTD: 495000,
      estimatedAnnual: 5670000,
    },
  };

  return NextResponse.json({ success: true, data: turnoverData });
}
