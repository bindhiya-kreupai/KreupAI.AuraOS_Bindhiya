import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const category = searchParams.get('category');

  const mockPlans = [
    {
      id: 'plan-health-001',
      name: 'Premium Health Plus',
      category: 'health',
      type: 'PPO',
      provider: 'Blue Cross Blue Shield',
      status: 'active',
      premiums: {
        employeeOnly: 250.0,
        employeeSpouse: 500.0,
        employeeChildren: 450.0,
        family: 700.0,
      },
      employerContribution: 80,
      deductible: { individual: 1500, family: 3000 },
      outOfPocketMax: { individual: 5000, family: 10000 },
      copay: { primaryCare: 25, specialist: 50, urgentCare: 75, emergency: 250 },
      enrollmentCount: 245,
    },
    {
      id: 'plan-health-002',
      name: 'Basic Health HDHP',
      category: 'health',
      type: 'HDHP',
      provider: 'Aetna',
      status: 'active',
      premiums: {
        employeeOnly: 150.0,
        employeeSpouse: 300.0,
        employeeChildren: 275.0,
        family: 425.0,
      },
      employerContribution: 75,
      deductible: { individual: 3000, family: 6000 },
      outOfPocketMax: { individual: 7000, family: 14000 },
      copay: { primaryCare: 0, specialist: 0, urgentCare: 0, emergency: 0 },
      hsaEligible: true,
      enrollmentCount: 180,
    },
    {
      id: 'plan-dental-001',
      name: 'Comprehensive Dental',
      category: 'dental',
      type: 'DPPO',
      provider: 'Delta Dental',
      status: 'active',
      premiums: {
        employeeOnly: 45.0,
        employeeSpouse: 85.0,
        employeeChildren: 80.0,
        family: 120.0,
      },
      employerContribution: 100,
      annualMax: 2000,
      deductible: { individual: 50, family: 150 },
      coverage: { preventive: 100, basic: 80, major: 50, orthodontia: 50 },
      enrollmentCount: 380,
    },
    {
      id: 'plan-vision-001',
      name: 'Vision Care Plus',
      category: 'vision',
      type: 'vision',
      provider: 'VSP',
      status: 'active',
      premiums: {
        employeeOnly: 15.0,
        employeeSpouse: 28.0,
        employeeChildren: 25.0,
        family: 40.0,
      },
      employerContribution: 100,
      examCopay: 10,
      frameAllowance: 200,
      contactLensAllowance: 150,
      enrollmentCount: 350,
    },
    {
      id: 'plan-life-001',
      name: 'Group Life Insurance',
      category: 'life',
      type: 'term',
      provider: 'MetLife',
      status: 'active',
      baseCoverage: '2x annual salary',
      maxCoverage: 500000,
      voluntaryOptions: [100000, 200000, 300000, 400000, 500000],
      employerPaid: true,
      enrollmentCount: 420,
    },
    {
      id: 'plan-401k-001',
      name: '401(k) Retirement Plan',
      category: 'retirement',
      type: '401k',
      provider: 'Fidelity',
      status: 'active',
      employerMatch: { percentage: 100, upTo: 6 },
      vestingSchedule: '3-year graded',
      contributionLimits: { employee: 23000, catchUp: 7500 },
      enrollmentCount: 395,
    },
  ];

  const filtered = category
    ? mockPlans.filter((plan) => plan.category === category)
    : mockPlans;

  return NextResponse.json({
    data: filtered,
    pagination: {
      page,
      limit,
      total: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
    },
  });
}
