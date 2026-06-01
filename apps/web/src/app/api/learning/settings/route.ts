import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const defaultSettings = {
  defaultPassingScore: 70,
  maxAttemptsDefault: 3,
  certificateExpiryDays: 365,
  reminderDaysBeforeExpiry: 30,
  autoEnrollCompliance: true,
  allowSelfEnrollment: true,
  requireManagerApproval: false,
  enableWaitlist: true,
  emailNotifications: {
    enrollmentConfirmation: true,
    courseCompletion: true,
    certificateIssued: true,
    sessionReminder: true,
    deadlineReminder: true,
    certificationExpiry: true,
  },
};

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEARNING, Action.READ, permissions);
      if (permissionError) return permissionError;

      return NextResponse.json({ success: true, data: defaultSettings });
    } catch (error: any) {
      logger.error('Error fetching settings:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch settings' }, { status: 500 });
    }
  }
);

export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEARNING, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const merged = { ...defaultSettings, ...body };

      logger.info('Settings updated by:', user.userId);
      return NextResponse.json({ success: true, data: merged });
    } catch (error: any) {
      logger.error('Error updating settings:', error);
      return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
    }
  }
);
