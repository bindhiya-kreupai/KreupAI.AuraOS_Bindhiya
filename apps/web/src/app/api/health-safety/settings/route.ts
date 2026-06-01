import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;

    const defaultSettings = {
      settingsId: `settings-${user.tenantId}`,
      organizationId: user.tenantId,
      incidentReporting: {
        requirePhotos: false,
        autoNotifySupervisor: true,
        escalationThresholdHours: 24,
      },
      safetyTraining: {
        mandatoryRefreshMonths: 12,
        autoEnroll: true,
      },
      notifications: {
        incidentReported: true,
        trainingDue: true,
        checkupReminder: true,
      },
      updatedAt: new Date().toISOString(),
      tenantId: user.tenantId,
    };

    return NextResponse.json(
      { success: true, data: defaultSettings },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching health-safety settings:', error);
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
      { success: true, data: settings },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating health-safety settings:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});
