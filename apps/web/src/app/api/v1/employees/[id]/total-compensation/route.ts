import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year') || '2024';

  const mockCompensation = {
    employeeId: id,
    year: parseInt(year),
    currency: 'USD',
    baseSalary: {
      annual: 120000.0,
      monthly: 10000.0,
      biWeekly: 4615.38,
      effectiveDate: '2024-01-01',
      nextReviewDate: '2025-01-01',
    },
    bonus: {
      targetPercentage: 15,
      targetAmount: 18000.0,
      actualPaid: 16200.0,
      frequency: 'annual',
      lastPaidDate: '2024-03-15',
      components: [
        { type: 'performance', amount: 12000.0, status: 'paid' },
        { type: 'spot', amount: 2000.0, status: 'paid' },
        { type: 'signing', amount: 2200.0, status: 'paid' },
      ],
    },
    equity: {
      totalGrantValue: 200000.0,
      vestedValue: 75000.0,
      unvestedValue: 125000.0,
      annualizedValue: 50000.0,
      grants: [
        {
          id: 'grant-001',
          type: 'RSU',
          grantDate: '2023-01-15',
          totalShares: 1000,
          vestedShares: 375,
          vestingSchedule: '4-year with 1-year cliff',
          currentSharePrice: 200.0,
        },
      ],
    },
    benefitsValue: {
      total: 18500.0,
      breakdown: [
        { type: 'health_insurance', employerContribution: 9600.0 },
        { type: 'dental_insurance', employerContribution: 1200.0 },
        { type: 'vision_insurance', employerContribution: 600.0 },
        { type: '401k_match', employerContribution: 6000.0 },
        { type: 'life_insurance', employerContribution: 600.0 },
        { type: 'disability_insurance', employerContribution: 500.0 },
      ],
    },
    perksValue: {
      total: 8200.0,
      breakdown: [
        { type: 'commuter_benefit', annualValue: 3000.0 },
        { type: 'wellness_stipend', annualValue: 1200.0 },
        { type: 'learning_development', annualValue: 2000.0 },
        { type: 'home_office', annualValue: 1000.0 },
        { type: 'phone_allowance', annualValue: 1000.0 },
      ],
    },
    total: {
      cashCompensation: 136200.0,
      equityAnnualized: 50000.0,
      benefitsValue: 18500.0,
      perksValue: 8200.0,
      totalCompensation: 212900.0,
    },
    comparativeData: {
      marketPercentile: 75,
      compRatio: 1.05,
      bandMin: 100000.0,
      bandMid: 115000.0,
      bandMax: 140000.0,
    },
  };

  return NextResponse.json({ data: mockCompensation });
}
