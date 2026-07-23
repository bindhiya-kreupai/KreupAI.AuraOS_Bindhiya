import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const settings = {
      tenureSettings: {
        probationaryPeriod: 6,
        tenureReviewTimeline: 12,
        externalReviewersRequired: 3,
        publicationMinimum: 5,
        teachingEvaluationMinimum: 3.5,
      },
      grantSettings: {
        indirectCostRate: 48,
        costSharingRequired: false,
        reportingFrequency: 'quarterly',
        approvalLevels: [
          { threshold: 50000, approver: 'Department Chair', required: true },
          { threshold: 250000, approver: 'Dean', required: true },
          { threshold: 1000000, approver: 'Provost', required: true },
        ],
      },
      adjunctSettings: {
        maxCoursesPerSemester: 2,
        minQualifications: ['Masters degree in field', '2 years teaching experience'],
        defaultCompensationRate: 3500,
        backgroundCheckRequired: true,
        orientationRequired: true,
        contractRenewalNoticeDays: 60,
      },
    };
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
