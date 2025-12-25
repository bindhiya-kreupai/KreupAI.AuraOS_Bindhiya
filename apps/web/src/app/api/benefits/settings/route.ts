import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.BENEFITS, Action.READ, permissions);
      if (permissionError) return permissionError;

      const mockSettings = {
        allowDependents: true,
        maxDependents: 5,
        requireDocumentation: true,
        autoApproveEnrollments: false,
        enableQualifyingEvents: true,
        claimSubmissionDeadlineDays: 90,
      };

      return NextResponse.json({ success: true, data: mockSettings });
    } catch {
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
      return NextResponse.json({ success: true, data: body });
    } catch {
      logger.error('Error updating settings:', error);
      return NextResponse.json({ success: false, error: 'Failed to update settings' }, { status: 500 });
    }
  }
);
