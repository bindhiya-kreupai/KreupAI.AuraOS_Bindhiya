import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ENGAGEMENT, Action.READ, permissions);
      if (permissionError) return permissionError;

      return NextResponse.json({
        success: true,
        data: {
          surveys: [],
          tenantId: user.tenantId,
        },
      });
    } catch (error) {
      logger.error('Error fetching surveys:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch surveys' }, { status: 500 });
    }
  }
);

export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ENGAGEMENT, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const newSurvey = {
        ...body,
        id: `survey-${Date.now()}`,
        tenantId: user.tenantId,
        createdBy: user.userId,
        createdAt: new Date().toISOString(),
      };

      return NextResponse.json({ success: true, data: newSurvey }, { status: 201 });
    } catch (error) {
      logger.error('Error creating survey:', error);
      return NextResponse.json({ success: false, error: 'Failed to create survey' }, { status: 500 });
    }
  }
);

export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ENGAGEMENT, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      return NextResponse.json({
        success: true,
        data: {
          ...body,
          tenantId: user.tenantId,
          lastModified: new Date().toISOString(),
          modifiedBy: user.userId,
        },
      });
    } catch (error) {
      logger.error('Error updating survey:', error);
      return NextResponse.json({ success: false, error: 'Failed to update survey' }, { status: 500 });
    }
  }
);
