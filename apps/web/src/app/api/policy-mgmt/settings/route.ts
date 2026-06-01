import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;

    const defaultSettings = {
      settingsId: `settings-${user.tenantId}`,
      organizationId: user.tenantId,
      approvalSettings: {
        levelsRequired: 2,
        autoReminder: true,
      },
      distributionSettings: {
        autoDistribute: true,
        reminderFrequencyDays: 7,
      },
      complianceSettings: {
        trackAcknowledgement: true,
        overdueThresholdDays: 14,
      },
      notifications: {
        policyPublished: true,
        acknowledgementDue: true,
        approvalRequired: true,
      },
      updatedAt: new Date().toISOString(),
      tenantId: user.tenantId,
    };

    return NextResponse.json(
      { success: true, data: { settings: defaultSettings } },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching policy settings:', error);
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
      ...body,
      settingsId: `settings-${user.tenantId}`,
      organizationId: user.tenantId,
      updatedAt: new Date().toISOString(),
      tenantId: user.tenantId,
    };

    return NextResponse.json(
      { success: true, data: { settings } },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating policy settings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});
