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

      const { searchParams } = new URL(request.url);
      const employeeId = searchParams.get('employeeId') || user.userId;

      const mockEnrollments = [
        {
          id: 'enroll-1',
          employeeId,
          benefitPlanId: 'plan-1',
          benefitPlanName: 'PPO Health Insurance',
          status: 'active',
          enrollmentDate: '2024-01-01',
          effectiveDate: '2024-01-01',
          totalPremium: 500,
          employeeContribution: 100,
          employerContribution: 400,
          createdAt: new Date().toISOString(),
        },
      ];

      return NextResponse.json({ success: true, data: mockEnrollments });
    } catch {
      logger.error('Error fetching enrollments:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch enrollments' }, { status: 500 });
    }
  }
);

export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.BENEFITS, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const newEnrollment = {
        ...body,
        id: `enroll-${Date.now()}`,
        status: 'pending',
        enrollmentDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      return NextResponse.json({ success: true, data: newEnrollment }, { status: 201 });
    } catch {
      logger.error('Error creating enrollment:', error);
      return NextResponse.json({ success: false, error: 'Failed to create enrollment' }, { status: 500 });
    }
  }
);

export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.BENEFITS, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      return NextResponse.json({ success: true, data: { ...body, updatedAt: new Date().toISOString() } });
    } catch {
      logger.error('Error updating enrollment:', error);
      return NextResponse.json({ success: false, error: 'Failed to update enrollment' }, { status: 500 });
    }
  }
);
