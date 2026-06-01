import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';

function getDefaultSettings(managerId: string) {
  return {
    settingsId: `settings-${managerId}`,
    managerId,
    dashboardLayout: [
      {
        widgetId: 'widget-001',
        widgetType: 'team_metrics',
        widgetTitle: 'Team Overview',
        position: { row: 0, col: 0, width: 2, height: 1 },
        visible: true,
        configuration: {},
      },
      {
        widgetId: 'widget-002',
        widgetType: 'pending_approvals',
        widgetTitle: 'Pending Approvals',
        position: { row: 0, col: 2, width: 1, height: 1 },
        visible: true,
        configuration: {},
      },
      {
        widgetId: 'widget-003',
        widgetType: 'performance_chart',
        widgetTitle: 'Team Performance',
        position: { row: 1, col: 0, width: 2, height: 1 },
        visible: true,
        configuration: {},
      },
    ],
    defaultView: 'overview',
    refreshInterval: 5,
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      notifyOnNewApproval: true,
      notifyOnApprovalOverdue: true,
      notifyOnTeamMilestone: true,
      notifyOnPerformanceAlert: true,
      dailyDigest: true,
      weeklyDigest: false,
    },
    approvalSettings: {
      requireCommentsOnRejection: true,
      allowBulkApproval: true,
      escalationTimeout: 48,
    },
    reportSettings: {
      favoriteReports: ['performance', 'attendance'],
      autoGenerateReports: false,
      reportFrequency: 'monthly',
      reportDeliveryEmail: '',
    },
    delegationSettings: {
      settingsId: `del-settings-${managerId}`,
      managerId,
      enableAutoDelegation: true,
      autoDelegateOnLeave: true,
      autoDelegateOnTravel: false,
      notifyOnDelegation: true,
      notifyOnDelegateAction: true,
      dailyDigest: true,
      requireApprovalForDelegation: false,
      maxDelegationDuration: 90,
      allowChainDelegation: false,
      audit: {
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system',
      },
    },
    audit: {
      createdAt: new Date(),
      createdBy: 'system',
      updatedAt: new Date(),
      updatedBy: 'system',
    },
  };
}

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const managerId = searchParams.get('managerId') || user.userId;

    const settings = getDefaultSettings(managerId);

    return NextResponse.json(settings, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching manager settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const managerId = body.managerId || user.userId;

    const currentSettings = getDefaultSettings(managerId);
    const updatedSettings = {
      ...currentSettings,
      ...body,
      managerId,
      audit: {
        ...currentSettings.audit,
        updatedAt: new Date(),
        updatedBy: user.userId,
      },
    };

    return NextResponse.json(updatedSettings, { status: 200 });
  } catch (error: any) {
    console.error('Error updating manager settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
