import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.BENEFITS, Action.READ, permissions);
      if (permissionError) return permissionError;

      const settings = {
        id: `settings_${user.tenantId}`,
        organizationId: user.tenantId,
        tenantId: user.tenantId,
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
        updatedAt: new Date().toISOString(),
        updatedBy: user.email || user.id,
      };

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
      const permissionError = requirePermission(Resource.BENEFITS, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();

      const updatedSettings = {
        ...body,
        id: `settings_${user.tenantId}`,
        organizationId: user.tenantId,
        tenantId: user.tenantId,
        updatedAt: new Date().toISOString(),
        updatedBy: user.email || user.id,
      };

      return NextResponse.json({ success: true, data: updatedSettings });
    } catch (error: any) {
      logger.error('Error updating settings:', error);
      return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
    }
  }
);
