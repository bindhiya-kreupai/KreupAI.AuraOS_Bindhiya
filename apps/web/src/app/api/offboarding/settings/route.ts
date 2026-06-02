import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { readSettings, writeSettings } from '@/lib/api/tenant-settings';
import { logger } from '@/lib/logger';

const MODULE = 'offboarding';

const DEFAULT_SETTINGS = {
  defaultNoticePeriod: 30,
  autoInitiateOffboarding: true,
  requireExitInterview: true,
  requireExitSurvey: true,
  exitSurveyAnonymous: false,
  exitSurveyExpiry: 30,
  sendExitSurveyAfter: 0,
  requireKnowledgeTransfer: true,
  knowledgeTransferDuration: 14,
  autoRevokeAccessOnExit: true,
  accessRevocationLeadTime: 0,
  autoCreateAlumniRecord: true,
  alumniOptInRequired: false,
  equipmentReturnReminder: 7,
  clearanceReminderFrequency: 'weekly' as const,
  finalSettlementDays: 45,
  allowCounterOffer: true,
  counterOfferApprovalRequired: true,
  notificationEmail: 'hr@company.com',
  hrNotificationEmail: 'hr@company.com',
  itNotificationEmail: 'it@company.com',
  financeNotificationEmail: 'finance@company.com',
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
