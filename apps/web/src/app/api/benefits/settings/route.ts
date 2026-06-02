import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { readSettings, writeSettings } from '@/lib/api/tenant-settings';
import { logger } from '@/lib/logger';

const MODULE = 'benefits';

const DEFAULT_SETTINGS = {
  openEnrollmentEnabled: true,
  autoEnrollNewHires: true,
  defaultEnrollmentWindowDays: 30,
  requireDependentVerification: true,
  allowMidYearChanges: false,
  qualifyingEventWindowDays: 60,
  newHireEnrollmentPeriodDays: 30,
  newHireWaitingPeriodDays: 0,
  defaultPaymentFrequency: 'monthly' as const,
  allowEmployerContributionVariance: true,
  requireACACompliance: true,
  requireCOBRANotifications: true,
  requireHIPAACompliance: true,
  sendEnrollmentReminders: true,
  reminderDaysBefore: [15, 7, 3, 1],
  sendCoverageChangeNotifications: true,
  enableProviderDirectory: true,
  requireInNetworkPreAuthorization: false,
  enableOnlineClaims: true,
  requireClaimReceipts: true,
  claimSubmissionDeadlineDays: 90,
  allowDependents: true,
  maxDependents: 10,
  requireDocumentation: true,
  autoApproveEnrollments: false,
  enableQualifyingEvents: true,
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
