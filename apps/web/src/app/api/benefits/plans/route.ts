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

      const mockPlans = [
        {
          id: 'plan-1',
          planCode: 'HEALTH-PPO-2024',
          planName: 'PPO Health Insurance',
          category: 'health_insurance',
          planYear: '2024',
          status: 'active',
          provider: 'Blue Cross',
          monthlyCost: 500,
          employeeContribution: 100,
          description: 'Comprehensive health insurance coverage',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'plan-2',
          planCode: 'DENTAL-BASE-2024',
          planName: 'Basic Dental Coverage',
          category: 'dental',
          planYear: '2024',
          status: 'active',
          provider: 'Delta Dental',
          monthlyCost: 50,
          employeeContribution: 20,
          description: 'Basic dental coverage',
          createdAt: new Date().toISOString(),
        },
      ];

      return NextResponse.json({ success: true, data: mockPlans });
    } catch {
      logger.error('Error fetching benefit plans:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch benefit plans' }, { status: 500 });
    }
  }
);

export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.BENEFITS, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const newPlan = { ...body, id: `plan-${Date.now()}`, createdAt: new Date().toISOString() };

      return NextResponse.json({ success: true, data: newPlan }, { status: 201 });
    } catch {
      logger.error('Error creating benefit plan:', error);
      return NextResponse.json({ success: false, error: 'Failed to create benefit plan' }, { status: 500 });
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
      logger.error('Error updating benefit plan:', error);
      return NextResponse.json({ success: false, error: 'Failed to update benefit plan' }, { status: 500 });
    }
  }
);

export const DELETE = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.BENEFITS, Action.DELETE, permissions);
      if (permissionError) return permissionError;

      return NextResponse.json({ success: true, message: 'Benefit plan deleted' });
    } catch {
      logger.error('Error deleting benefit plan:', error);
      return NextResponse.json({ success: false, error: 'Failed to delete benefit plan' }, { status: 500 });
    }
  }
);
