import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { readSettings, writeSettings } from '@/lib/api/tenant-settings';
import { logger } from '@/lib/logger';

const MODULE = 'industryRetail';

const DEFAULT_SETTINGS = {
  commissionAutoApproval: false,
  seasonalHiringWindow: { start: '2026-10-01', end: '2027-01-31' },
  storePerformanceAlertsThreshold: 0.85,
  enableCommissionTracking: true,
  enableSeasonalHiring: true,
  enableStoreManagement: true,
  storePerformanceReportPeriod: 'monthly',
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
