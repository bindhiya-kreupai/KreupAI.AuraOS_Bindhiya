import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ENGAGEMENT, Action.READ, permissions);
      if (permissionError) return permissionError;

      const mockSurveys = [
        {
          id: 'survey-1',
          title: 'Employee Satisfaction Q1 2024',
          description: 'Quarterly employee satisfaction survey',
          type: 'pulse',
          status: 'active',
          responseCount: 145,
          targetAudience: 'all_employees',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          createdAt: new Date().toISOString(),
        },
      ];

      return NextResponse.json({ success: true, data: mockSurveys });
    } catch {
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
        createdAt: new Date().toISOString(),
      };

      return NextResponse.json({ success: true, data: newSurvey }, { status: 201 });
    } catch {
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
      return NextResponse.json({ success: true, data: { ...body, lastModified: new Date().toISOString() } });
    } catch {
      logger.error('Error updating survey:', error);
      return NextResponse.json({ success: false, error: 'Failed to update survey' }, { status: 500 });
    }
  }
);
