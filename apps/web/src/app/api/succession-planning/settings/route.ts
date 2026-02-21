import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;

    const defaultSettings = {
      settings: {
        reviewFrequency: 'annual',
        mandatorySuccessionDepth: 2,
        retirementNoticeMonths: 12,
        talentReviewCalendar: [],
        nineBoxEnabled: true,
        emergencyPlanRequired: true,
        autoNotifications: {
          vacancyRiskAlert: true,
          developmentPlanDue: true,
          talentReviewReminder: true,
          readinessDateApproaching: true,
          retirementAlert: true,
        },
      },
      tenantId: user.tenantId,
    };

    return NextResponse.json(
      { success: true, data: defaultSettings },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching succession settings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const settings = {
      settings: {
        ...body,
      },
      tenantId: user.tenantId,
    };

    return NextResponse.json(
      { success: true, data: settings },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating succession settings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});
