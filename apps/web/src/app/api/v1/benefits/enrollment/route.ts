import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const mockEnrollments = [
    {
      id: 'enroll-001',
      employeeId: 'emp-001',
      planId: 'plan-health-001',
      planName: 'Premium Health Plus',
      planCategory: 'health',
      coverageLevel: 'family',
      status: 'active',
      effectiveDate: '2024-01-01',
      endDate: null,
      premiumEmployee: 140.0,
      premiumEmployer: 560.0,
      premiumTotal: 700.0,
      payFrequency: 'monthly',
      coveredDependents: ['dep-001', 'dep-002', 'dep-003'],
      enrolledAt: '2023-11-15T10:00:00Z',
      lastModifiedAt: '2023-11-15T10:00:00Z',
    },
    {
      id: 'enroll-002',
      employeeId: 'emp-001',
      planId: 'plan-dental-001',
      planName: 'Comprehensive Dental',
      planCategory: 'dental',
      coverageLevel: 'family',
      status: 'active',
      effectiveDate: '2024-01-01',
      endDate: null,
      premiumEmployee: 0.0,
      premiumEmployer: 120.0,
      premiumTotal: 120.0,
      payFrequency: 'monthly',
      coveredDependents: ['dep-001', 'dep-002', 'dep-003'],
      enrolledAt: '2023-11-15T10:05:00Z',
      lastModifiedAt: '2023-11-15T10:05:00Z',
    },
    {
      id: 'enroll-003',
      employeeId: 'emp-001',
      planId: 'plan-vision-001',
      planName: 'Vision Care Plus',
      planCategory: 'vision',
      coverageLevel: 'employee_spouse',
      status: 'active',
      effectiveDate: '2024-01-01',
      endDate: null,
      premiumEmployee: 0.0,
      premiumEmployer: 28.0,
      premiumTotal: 28.0,
      payFrequency: 'monthly',
      coveredDependents: ['dep-001'],
      enrolledAt: '2023-11-15T10:10:00Z',
      lastModifiedAt: '2023-11-15T10:10:00Z',
    },
    {
      id: 'enroll-004',
      employeeId: 'emp-001',
      planId: 'plan-401k-001',
      planName: '401(k) Retirement Plan',
      planCategory: 'retirement',
      coverageLevel: 'employee',
      status: 'active',
      effectiveDate: '2024-01-01',
      endDate: null,
      contributionPercentage: 8,
      contributionAmount: 800.0,
      employerMatchAmount: 600.0,
      payFrequency: 'monthly',
      coveredDependents: [],
      enrolledAt: '2023-11-15T10:15:00Z',
      lastModifiedAt: '2024-03-01T09:00:00Z',
    },
  ];

  return NextResponse.json({
    data: mockEnrollments,
    pagination: {
      page,
      limit,
      total: mockEnrollments.length,
      totalPages: 1,
    },
    summary: {
      totalMonthlyEmployeeCost: 140.0,
      totalMonthlyEmployerCost: 1308.0,
      activePlans: 4,
      coveredDependents: 3,
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { planId, coverageLevel, dependentIds, effectiveDate } = body;

  if (!planId || !coverageLevel) {
    return NextResponse.json(
      {
        error: 'Bad Request',
        message: 'Fields planId and coverageLevel are required',
      },
      { status: 400 }
    );
  }

  const newEnrollment = {
    id: 'enroll-' + Date.now(),
    employeeId: 'emp-001',
    planId,
    planName: 'Selected Plan',
    planCategory: 'health',
    coverageLevel,
    status: 'pending',
    effectiveDate: effectiveDate || '2024-01-01',
    endDate: null,
    premiumEmployee: 140.0,
    premiumEmployer: 560.0,
    premiumTotal: 700.0,
    payFrequency: 'monthly',
    coveredDependents: dependentIds || [],
    enrolledAt: new Date().toISOString(),
    lastModifiedAt: new Date().toISOString(),
    confirmationNumber: 'ENR-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
  };

  return NextResponse.json({ data: newEnrollment }, { status: 201 });
}
