import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { readSettings, writeSettings } from '@/lib/api/tenant-settings';
import { logger } from '@/lib/logger';

const MODULE = 'onboarding';

const DEFAULT_SETTINGS = {
  defaultProgramDuration: 90,
  requireBuddy: true,
  requirePreBoarding: true,
  surveyEnabled: true,
  surveySchedule: ['day_1', 'week_1', 'day_30', 'day_60', 'day_90'],
  autoAssignTasks: true,
  notifyManager: true,
  notifyIT: true,
  equipmentLeadTimeDays: 5,
  autoAssignBuddy: true,
  buddyMatchingCriteria: 'department',
  autoSendPreBoarding: true,
  preBoardingDaysBeforeStart: 7,
  autoCreateTasks: true,
  sendTaskReminders: true,
  reminderDaysBefore: 2,
  enableSurveys: true,
  enable30_60_90Plan: true,
  requireManagerReview: true,
  managerReviewFrequency: 'weekly',
  autoNotifications: {
    newHireWelcome: true,
    preBoardingPackage: true,
    taskAssigned: true,
    taskDue: true,
    taskOverdue: true,
    documentPending: true,
    equipmentReady: true,
    accessGranted: true,
    surveyDue: true,
    buddyAssigned: true,
    milestoneReached: true,
    completionCertificate: true,
  },
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
