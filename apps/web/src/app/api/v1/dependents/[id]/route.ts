import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  const { permissions } = context;
  if (!permissions.includes('dependents:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing dependents:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  const { id } = context.params;

  const mockDependent = {
    id,
    employeeId: 'emp-001',
    name: 'Emily Smith',
    relationship: 'spouse',
    dateOfBirth: '1990-05-15',
    ssn: '***-**-1234',
    gender: 'female',
    enrolledInBenefits: true,
    benefitPlans: ['health-001', 'dental-001', 'vision-001'],
    address: {
      street: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zip: '94102',
    },
    primaryCarePhysician: 'Dr. Rebecca Martinez',
    addedAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-06-20T14:30:00Z',
  };

  return NextResponse.json({ data: mockDependent });
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  const { permissions } = context;
  if (!permissions.includes('dependents:update')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing dependents:update permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  const { id } = context.params;
  const body = await request.json();

  const updatedDependent = {
    id,
    employeeId: 'emp-001',
    name: body.name || 'Emily Smith',
    relationship: body.relationship || 'spouse',
    dateOfBirth: body.dob || '1990-05-15',
    ssn: body.ssn ? '***-**-' + body.ssn.slice(-4) : '***-**-1234',
    gender: body.gender || 'female',
    enrolledInBenefits: body.enrolledInBenefits ?? true,
    benefitPlans: body.benefitPlans || ['health-001', 'dental-001', 'vision-001'],
    addedAt: '2024-01-15T10:00:00Z',
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({ data: updatedDependent });
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  const { permissions } = context;
  if (!permissions.includes('dependents:delete')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing dependents:delete permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  const { id } = context.params;

  return NextResponse.json({
    data: {
      id,
      deleted: true,
      deletedAt: new Date().toISOString(),
      message: `Dependent ${id} has been successfully removed`,
    },
  });
});
