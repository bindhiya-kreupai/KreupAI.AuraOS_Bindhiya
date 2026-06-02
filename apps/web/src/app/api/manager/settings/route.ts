import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { readSettings, writeSettings } from '@/lib/api/tenant-settings';
import { logger } from '@/lib/logger';

const MODULE = 'manager';

const DEFAULT_SETTINGS = {
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
    enableAutoDelegation: true,
    autoDelegateOnLeave: true,
    autoDelegateOnTravel: false,
    notifyOnDelegation: true,
    notifyOnDelegateAction: true,
    dailyDigest: true,
    requireApprovalForDelegation: false,
    maxDelegationDuration: 90,
    allowChainDelegation: false,
    audit: {},
  },
  audit: {},
};

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const tenantId = context.user.tenantId;
    const settings = await readSettings(tenantId, MODULE, DEFAULT_SETTINGS);
    return NextResponse.json({ success: true, data: { ...settings, tenantId } });
  } catch (error: any) {
    logger.error({ err: error, module: MODULE }, 'Failed to read settings');
    return NextResponse.json(
      { success: false, error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const tenantId = context.user.tenantId;
    const userId = context.user.userId;
    const body = await request.json();
    // Strip server-managed fields so callers can't overwrite them.
    delete body.tenantId;
    delete body.updatedBy;
    delete body.updatedAt;
    await writeSettings(tenantId, MODULE, body, userId);
    const settings = await readSettings(tenantId, MODULE, DEFAULT_SETTINGS);
    return NextResponse.json({ success: true, data: { ...settings, tenantId } });
  } catch (error: any) {
    logger.error({ err: error, module: MODULE }, 'Failed to update settings');
    return NextResponse.json(
      { success: false, error: 'Failed to update settings' },
      { status: 500 }
    );
  }
});
