import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

function getDefaultSettings(tenantId: string) {
  return {
    tenantId,
    requireApproval: true,
    approvalLevels: 2,
    allowSelfBooking: false,
    advanceAllowed: true,
    maxAdvancePercentage: 80,
    travelAgencyIntegration: false,
    notificationEmail: `travel@${tenantId}.company.com`,
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
    audit: {
      createdAt: new Date().toISOString(),
      createdBy: 'system',
      updatedAt: new Date().toISOString(),
      updatedBy: 'system',
    },
  };
}

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.TRAVEL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const settings = getDefaultSettings(user.tenantId);

      return NextResponse.json({ success: true, data: settings });
    } catch (error: any) {
      logger.error('Error fetching settings:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
    }
  }
);

export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.TRAVEL, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const currentSettings = getDefaultSettings(user.tenantId);
      const updatedSettings = {
        ...currentSettings,
        ...body,
        tenantId: user.tenantId,
        audit: {
          ...currentSettings.audit,
          updatedAt: new Date().toISOString(),
          updatedBy: user.userId,
        },
      };

      return NextResponse.json({ success: true, data: updatedSettings });
    } catch (error: any) {
      logger.error('Error updating settings:', error);
      return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
    }
  }
);
