import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const mockEnrollmentStatus = {
    currentPeriod: {
      id: 'period-2024',
      name: 'Annual Open Enrollment 2025',
      type: 'open_enrollment',
      status: 'active',
      startDate: '2024-11-01T00:00:00Z',
      endDate: '2024-11-30T23:59:59Z',
      effectiveDate: '2025-01-01',
      daysRemaining: 12,
      isOpen: true,
    },
    employeeStatus: {
      employeeId: 'emp-001',
      enrollmentComplete: false,
      requiredActions: [
        {
          action: 'review_health_plan',
          description: 'Review and confirm health plan selection',
          completed: true,
          completedAt: '2024-11-05T10:00:00Z',
        },
        {
          action: 'review_dental_plan',
          description: 'Review and confirm dental plan selection',
          completed: true,
          completedAt: '2024-11-05T10:05:00Z',
        },
        {
          action: 'update_beneficiaries',
          description: 'Review and update life insurance beneficiaries',
          completed: false,
          completedAt: null,
        },
        {
          action: 'confirm_dependents',
          description: 'Verify dependent information is current',
          completed: false,
          completedAt: null,
        },
      ],
      completionPercentage: 50,
      lastActivityAt: '2024-11-05T10:05:00Z',
    },
    qualifyingLifeEvents: {
      eligible: true,
      recentEvents: [
        {
          id: 'qle-001',
          type: 'marriage',
          eventDate: '2024-08-15',
          reportedDate: '2024-08-20',
          enrollmentDeadline: '2024-09-14',
          status: 'completed',
        },
      ],
      allowedEventTypes: [
        'marriage',
        'divorce',
        'birth_adoption',
        'loss_of_coverage',
        'relocation',
        'death_of_dependent',
      ],
    },
    upcomingPeriods: [
      {
        id: 'period-2025-mid',
        name: 'Mid-Year FSA Enrollment',
        type: 'special_enrollment',
        startDate: '2025-06-01T00:00:00Z',
        endDate: '2025-06-15T23:59:59Z',
        effectiveDate: '2025-07-01',
      },
    ],
  };

  return NextResponse.json({ data: mockEnrollmentStatus });
}
