import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

function getDefaultSettings(tenantId: string) {
  return {
    tenantId,
    enablePulseSurveys: true,
    enableEvents: true,
    enableSocialFeed: true,
    enableInnovation: true,
    enableCSR: true,
    enableRecognition: true,
    enableNewsletter: true,
    enablePolls: true,
    enableReferrals: true,
    enableRewards: true,
    surveyAnonymityDefault: true,
    eventAutoApproval: false,
    socialModerationEnabled: false,
    recognitionPointsEnabled: true,
    defaultPointsPerRecognition: 10,
    maxPointsPerMonth: 100,
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
      const permissionError = requirePermission(Resource.ENGAGEMENT, Action.READ, permissions);
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
      const permissionError = requirePermission(Resource.ENGAGEMENT, Action.UPDATE, permissions);
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
