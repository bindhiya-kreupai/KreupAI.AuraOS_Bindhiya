import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();

  const updatedEnrollment = {
    id,
    employeeId: 'emp-001',
    planId: body.planId || 'plan-health-001',
    planName: body.planName || 'Premium Health Plus',
    planCategory: body.planCategory || 'health',
    coverageLevel: body.coverageLevel || 'family',
    status: 'active',
    effectiveDate: body.effectiveDate || '2024-01-01',
    endDate: null,
    premiumEmployee: body.premiumEmployee || 140.0,
    premiumEmployer: body.premiumEmployer || 560.0,
    premiumTotal: body.premiumTotal || 700.0,
    payFrequency: 'monthly',
    coveredDependents: body.dependentIds || ['dep-001', 'dep-002', 'dep-003'],
    enrolledAt: '2023-11-15T10:00:00Z',
    lastModifiedAt: new Date().toISOString(),
    changeReason: body.changeReason || 'plan_update',
    changeEffectiveDate: body.changeEffectiveDate || new Date().toISOString(),
  };

  return NextResponse.json({ data: updatedEnrollment });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const { searchParams } = new URL(request.url);
  const reason = searchParams.get('reason') || 'voluntary_cancellation';

  return NextResponse.json({
    data: {
      id,
      status: 'cancelled',
      cancellationDate: new Date().toISOString(),
      effectiveEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      reason,
      message: `Enrollment ${id} has been cancelled. Coverage will end at the end of the current billing period.`,
      cobraEligible: true,
      cobraNotificationDate: new Date().toISOString(),
    },
  });
}
