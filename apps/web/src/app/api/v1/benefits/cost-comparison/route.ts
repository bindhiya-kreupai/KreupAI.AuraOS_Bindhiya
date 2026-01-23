/**
 * @api GET /api/v1/benefits/cost-comparison
 * @description Compare plan costs across available benefit plans
 */

import { NextRequest, NextResponse } from 'next/server';

interface PlanCostComparison {
  planId: string;
  planName: string;
  category: string;
  type: string;
  provider: string;
  coverageLevels: {
    level: string;
    employeeMonthlyCost: number;
    employerMonthlyCost: number;
    totalMonthlyCost: number;
    annualEmployeeCost: number;
    annualTotalCost: number;
  }[];
  deductible: {
    individual: number;
    family: number;
  };
  outOfPocketMax: {
    individual: number;
    family: number;
  };
  estimatedAnnualCost: {
    low: number;
    medium: number;
    high: number;
  };
  hsaEligible: boolean;
  rating: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'health';
  const coverageLevel = searchParams.get('coverageLevel') || 'employee_only';
  const planIds = searchParams.get('planIds')?.split(',');

  const mockComparisons: PlanCostComparison[] = [
    {
      planId: 'plan-health-001',
      planName: 'Premium Health Plus',
      category: 'health',
      type: 'PPO',
      provider: 'Blue Cross Blue Shield',
      coverageLevels: [
        { level: 'employee_only', employeeMonthlyCost: 50, employerMonthlyCost: 200, totalMonthlyCost: 250, annualEmployeeCost: 600, annualTotalCost: 3000 },
        { level: 'employee_spouse', employeeMonthlyCost: 100, employerMonthlyCost: 400, totalMonthlyCost: 500, annualEmployeeCost: 1200, annualTotalCost: 6000 },
        { level: 'employee_children', employeeMonthlyCost: 90, employerMonthlyCost: 360, totalMonthlyCost: 450, annualEmployeeCost: 1080, annualTotalCost: 5400 },
        { level: 'family', employeeMonthlyCost: 140, employerMonthlyCost: 560, totalMonthlyCost: 700, annualEmployeeCost: 1680, annualTotalCost: 8400 },
      ],
      deductible: { individual: 1500, family: 3000 },
      outOfPocketMax: { individual: 5000, family: 10000 },
      estimatedAnnualCost: { low: 2100, medium: 4500, high: 7500 },
      hsaEligible: false,
      rating: 4.5,
    },
    {
      planId: 'plan-health-002',
      planName: 'Basic Health HDHP',
      category: 'health',
      type: 'HDHP',
      provider: 'Aetna',
      coverageLevels: [
        { level: 'employee_only', employeeMonthlyCost: 25, employerMonthlyCost: 125, totalMonthlyCost: 150, annualEmployeeCost: 300, annualTotalCost: 1800 },
        { level: 'employee_spouse', employeeMonthlyCost: 60, employerMonthlyCost: 240, totalMonthlyCost: 300, annualEmployeeCost: 720, annualTotalCost: 3600 },
        { level: 'employee_children', employeeMonthlyCost: 55, employerMonthlyCost: 220, totalMonthlyCost: 275, annualEmployeeCost: 660, annualTotalCost: 3300 },
        { level: 'family', employeeMonthlyCost: 85, employerMonthlyCost: 340, totalMonthlyCost: 425, annualEmployeeCost: 1020, annualTotalCost: 5100 },
      ],
      deductible: { individual: 3000, family: 6000 },
      outOfPocketMax: { individual: 7000, family: 14000 },
      estimatedAnnualCost: { low: 3300, medium: 5800, high: 10000 },
      hsaEligible: true,
      rating: 4.0,
    },
    {
      planId: 'plan-health-003',
      planName: 'Standard Health HMO',
      category: 'health',
      type: 'HMO',
      provider: 'Kaiser Permanente',
      coverageLevels: [
        { level: 'employee_only', employeeMonthlyCost: 35, employerMonthlyCost: 165, totalMonthlyCost: 200, annualEmployeeCost: 420, annualTotalCost: 2400 },
        { level: 'employee_spouse', employeeMonthlyCost: 75, employerMonthlyCost: 325, totalMonthlyCost: 400, annualEmployeeCost: 900, annualTotalCost: 4800 },
        { level: 'employee_children', employeeMonthlyCost: 65, employerMonthlyCost: 285, totalMonthlyCost: 350, annualEmployeeCost: 780, annualTotalCost: 4200 },
        { level: 'family', employeeMonthlyCost: 110, employerMonthlyCost: 440, totalMonthlyCost: 550, annualEmployeeCost: 1320, annualTotalCost: 6600 },
      ],
      deductible: { individual: 500, family: 1000 },
      outOfPocketMax: { individual: 3000, family: 6000 },
      estimatedAnnualCost: { low: 920, medium: 2800, high: 5000 },
      hsaEligible: false,
      rating: 4.2,
    },
  ];

  let filtered = mockComparisons.filter((p) => p.category === category);

  if (planIds?.length) {
    filtered = filtered.filter((p) => planIds.includes(p.planId));
  }

  // Calculate savings comparison
  const savings = filtered.length >= 2 ? {
    lowestCostPlan: filtered.reduce((min, p) => {
      const level = p.coverageLevels.find((c) => c.level === coverageLevel);
      const minLevel = min.coverageLevels.find((c) => c.level === coverageLevel);
      return (level?.annualEmployeeCost || 0) < (minLevel?.annualEmployeeCost || 0) ? p : min;
    }).planId,
    potentialAnnualSavings: Math.max(
      ...filtered.map((p) => p.coverageLevels.find((c) => c.level === coverageLevel)?.annualEmployeeCost || 0)
    ) - Math.min(
      ...filtered.map((p) => p.coverageLevels.find((c) => c.level === coverageLevel)?.annualEmployeeCost || 0)
    ),
  } : null;

  return NextResponse.json({
    data: {
      plans: filtered,
      coverageLevel,
      savings,
      disclaimer: 'Estimated costs are based on average usage patterns. Actual costs may vary based on individual healthcare utilization.',
    },
  });
}
