import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const department = searchParams.get('department');

  const compensationData = {
    generatedAt: '2026-01-23T00:00:00Z',
    summary: {
      totalPayroll: 156000000,
      averageSalary: 125060,
      medianSalary: 112000,
      salaryRangeMin: 45000,
      salaryRangeMax: 425000,
      totalBenefitsCost: 31200000,
      benefitsPerEmployee: 25020,
    },
    byDepartment: [
      { department: 'Engineering', avgSalary: 145000, median: 138000, min: 85000, max: 280000, headcount: 342 },
      { department: 'Sales', avgSalary: 118000, median: 105000, min: 55000, max: 320000, headcount: 215 },
      { department: 'Marketing', avgSalary: 108000, median: 98000, min: 52000, max: 220000, headcount: 128 },
      { department: 'Finance', avgSalary: 125000, median: 115000, min: 62000, max: 245000, headcount: 104 },
      { department: 'Product', avgSalary: 140000, median: 132000, min: 78000, max: 265000, headcount: 95 },
      { department: 'Operations', avgSalary: 95000, median: 88000, min: 45000, max: 195000, headcount: 178 },
    ],
    payEquity: {
      genderGap: {
        overall: 3.2,
        adjustedGap: 1.1,
        byLevel: [
          { level: 'Individual Contributor', gap: 2.1 },
          { level: 'Manager', gap: 3.8 },
          { level: 'Director', gap: 4.5 },
          { level: 'VP+', gap: 5.2 },
        ],
      },
      ethnicityGap: {
        overall: 4.1,
        adjustedGap: 1.8,
      },
      compRatio: {
        average: 0.98,
        belowRange: 45,
        withinRange: 1156,
        aboveRange: 46,
      },
    },
    marketComparison: {
      overallPosition: 'P65',
      byRole: [
        { role: 'Software Engineer', internal: 142000, market50: 135000, market75: 155000, position: 'P58' },
        { role: 'Product Manager', internal: 148000, market50: 145000, market75: 168000, position: 'P52' },
        { role: 'Sales Representative', internal: 95000, market50: 88000, market75: 105000, position: 'P62' },
        { role: 'Data Scientist', internal: 155000, market50: 148000, market75: 172000, position: 'P55' },
      ],
      lastBenchmarkDate: '2025-11-15T00:00:00Z',
      dataSource: 'Radford, Mercer, Levels.fyi',
    },
    budgetUtilization: {
      annualBudget: 165000000,
      utilized: 156000000,
      remaining: 9000000,
      utilizationRate: 94.5,
      projectedYearEnd: 163500000,
    },
    trends: [
      { quarter: '2025-Q1', avgSalary: 120500, totalPayroll: 148200000 },
      { quarter: '2025-Q2', avgSalary: 121800, totalPayroll: 150600000 },
      { quarter: '2025-Q3', avgSalary: 123200, totalPayroll: 152800000 },
      { quarter: '2025-Q4', avgSalary: 124500, totalPayroll: 155100000 },
      { quarter: '2026-Q1', avgSalary: 125060, totalPayroll: 156000000 },
    ],
  };

  return NextResponse.json({ success: true, data: compensationData });
}
