import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { readSettings, writeSettings } from '@/lib/api/tenant-settings';
import { logger } from '@/lib/logger';

const MODULE = 'attendance';

const DEFAULT_SETTINGS = {
  workingDaysPerWeek: 5,
  weekendDays: [0, 6],
  standardWorkingHours: 8,
  gracePeriodMinutes: 15,
  earlyExitBufferMinutes: 10,
  halfDayThresholdHours: 4,
  enableBiometric: true,
  enableGeofencing: false,
  enableMobileCheckIn: true,
  requirePhotoOnCheckIn: false,
  autoMarkAbsent: true,
  autoMarkAbsentAfterHours: 4,
  enableOvertimeTracking: true,
  overtimeAutoApproval: false,
  maxOvertimeHoursPerDay: 4,
  maxOvertimeHoursPerMonth: 40,
  enableShiftRotation: false,
  enableAttendanceRegularization: true,
  regularizationRequiresApproval: true,
  regularizationDeadlineDays: 7,
  enableWFH: true,
  wfhRequiresApproval: true,
  maxWFHDaysPerMonth: 10,
  notificationEmail: 'hr@company.com',
  hrNotificationEmail: 'hr@company.com',
  managerNotificationEmail: '',
  sendDailySummary: true,
  sendWeeklySummary: true,
  sendMonthlySummary: true,
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
