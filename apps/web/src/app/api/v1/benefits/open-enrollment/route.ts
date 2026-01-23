/**
 * @api POST /api/v1/benefits/open-enrollment
 * @description Initiate or manage open enrollment period (admin)
 */

import { NextRequest, NextResponse } from 'next/server';

interface OpenEnrollmentConfig {
  id: string;
  tenantId: string;
  name: string;
  startDate: string;
  endDate: string;
  effectiveDate: string;
  status: 'draft' | 'active' | 'closed' | 'completed';
  eligibleEmployees: number;
  enrolledEmployees: number;
  notificationsSent: boolean;
  createdBy: string;
  createdAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, startDate, endDate, effectiveDate, notifyEmployees } = body;

    if (!startDate || !endDate || !effectiveDate) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'Fields startDate, endDate, and effectiveDate are required',
        },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const effective = new Date(effectiveDate);

    if (end <= start) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'endDate must be after startDate' },
        { status: 422 }
      );
    }

    if (effective <= end) {
      return NextResponse.json(
        { error: 'Validation Error', message: 'effectiveDate must be after endDate' },
        { status: 422 }
      );
    }

    const openEnrollment: OpenEnrollmentConfig = {
      id: 'oe-' + Date.now().toString(36),
      tenantId: 'tenant-001',
      name: name || `Open Enrollment ${new Date(effectiveDate).getFullYear()}`,
      startDate,
      endDate,
      effectiveDate,
      status: 'active',
      eligibleEmployees: 425,
      enrolledEmployees: 0,
      notificationsSent: notifyEmployees ?? true,
      createdBy: 'admin-001',
      createdAt: new Date().toISOString(),
    };

    const response = {
      data: openEnrollment,
      notifications: notifyEmployees !== false ? {
        emailsSent: 425,
        pushNotificationsSent: 380,
        reminderScheduled: true,
        reminderDates: [
          new Date(new Date(endDate).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          new Date(new Date(endDate).getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          new Date(new Date(endDate).getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        ],
      } : null,
      message: `Open enrollment period "${openEnrollment.name}" has been initiated successfully.`,
    };

    return NextResponse.json(response, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  const mockOpenEnrollments = [
    {
      id: 'oe-2025',
      name: 'Annual Open Enrollment 2025',
      startDate: '2024-11-01T00:00:00Z',
      endDate: '2024-11-30T23:59:59Z',
      effectiveDate: '2025-01-01',
      status: 'completed',
      eligibleEmployees: 420,
      enrolledEmployees: 395,
      completionRate: 94.0,
      notificationsSent: true,
      createdAt: '2024-10-15T09:00:00Z',
    },
    {
      id: 'oe-2026',
      name: 'Annual Open Enrollment 2026',
      startDate: '2025-11-01T00:00:00Z',
      endDate: '2025-11-30T23:59:59Z',
      effectiveDate: '2026-01-01',
      status: 'draft',
      eligibleEmployees: 0,
      enrolledEmployees: 0,
      completionRate: 0,
      notificationsSent: false,
      createdAt: '2025-09-01T09:00:00Z',
    },
  ];

  return NextResponse.json({ data: mockOpenEnrollments });
}
