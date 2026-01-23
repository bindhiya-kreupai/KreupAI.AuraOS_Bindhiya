import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const mockDependents = [
    {
      id: 'dep-001',
      employeeId: 'emp-001',
      name: 'Emily Smith',
      relationship: 'spouse',
      dateOfBirth: '1990-05-15',
      ssn: '***-**-1234',
      gender: 'female',
      enrolledInBenefits: true,
      benefitPlans: ['health-001', 'dental-001', 'vision-001'],
      addedAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: 'dep-002',
      employeeId: 'emp-001',
      name: 'Michael Smith',
      relationship: 'child',
      dateOfBirth: '2015-08-22',
      ssn: '***-**-5678',
      gender: 'male',
      enrolledInBenefits: true,
      benefitPlans: ['health-001', 'dental-001', 'vision-001'],
      addedAt: '2024-01-15T10:05:00Z',
      updatedAt: '2024-01-15T10:05:00Z',
    },
    {
      id: 'dep-003',
      employeeId: 'emp-001',
      name: 'Sophia Smith',
      relationship: 'child',
      dateOfBirth: '2018-03-10',
      ssn: '***-**-9012',
      gender: 'female',
      enrolledInBenefits: true,
      benefitPlans: ['health-001', 'dental-001'],
      addedAt: '2024-01-15T10:10:00Z',
      updatedAt: '2024-01-15T10:10:00Z',
    },
  ];

  return NextResponse.json({
    data: mockDependents,
    pagination: {
      page,
      limit,
      total: mockDependents.length,
      totalPages: 1,
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, relationship, dob, ssn } = body;

  if (!name || !relationship || !dob || !ssn) {
    return NextResponse.json(
      {
        error: 'Bad Request',
        message: 'Fields name, relationship, dob, and ssn are required',
      },
      { status: 400 }
    );
  }

  const newDependent = {
    id: 'dep-' + Date.now(),
    employeeId: 'emp-001',
    name,
    relationship,
    dateOfBirth: dob,
    ssn: '***-**-' + ssn.slice(-4),
    gender: body.gender || null,
    enrolledInBenefits: false,
    benefitPlans: [],
    addedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({ data: newDependent }, { status: 201 });
}
