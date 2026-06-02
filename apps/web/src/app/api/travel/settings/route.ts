import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { readSettings, writeSettings } from '@/lib/api/tenant-settings';
import { logger } from '@/lib/logger';

const MODULE = 'travel';

const DEFAULT_SETTINGS = {
  requireApproval: true,
  approvalLevels: 2,
  allowSelfBooking: false,
  advanceAllowed: true,
  maxAdvancePercentage: 80,
  travelAgencyIntegration: false,
  perDiemRates: {
    tier1: { lodging: 350, meals: 110, incidentals: 30 },
    tier2: { lodging: 250, meals: 80, incidentals: 20 },
    tier3: { lodging: 180, meals: 50, incidentals: 15 },
  },
  mileageRate: 0.65,
  currency: 'USD',
  policies: {
    domesticFlightClass: 'Economy',
    internationalFlightClass: 'Economy',
    businessClassThreshold: 6,
    advanceBookingDays: 14,
    maxHotelRate: {
      tier1: 350,
      tier2: 250,
      standard: 180,
    },
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
