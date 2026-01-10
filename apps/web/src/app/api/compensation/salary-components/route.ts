import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.COMPENSATION, Action.READ, permissions);
      if (permissionError) return permissionError;

      const mockComponents = [
        {
          id: 'comp-1',
          componentCode: 'BASIC',
          componentName: 'Basic Salary',
          type: 'earning',
          calculationType: 'fixed',
          isMandatory: true,
          isStatutory: false,
          isTaxable: true,
          displayOrder: 1,
          isActive: true,
        },
        {
          id: 'comp-2',
          componentCode: 'HRA',
          componentName: 'House Rent Allowance',
          type: 'earning',
          calculationType: 'percentage',
          isMandatory: false,
          isStatutory: false,
          isTaxable: true,
          displayOrder: 2,
          isActive: true,
        },
      ];

      return NextResponse.json({ success: true, data: mockComponents });
    } catch (error) {
      logger.error('Error fetching salary components:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch salary components' }, { status: 500 });
    }
  }
);

export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.COMPENSATION, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const newComponent = { ...body, id: `comp-${Date.now()}`, createdAt: new Date().toISOString() };

      return NextResponse.json({ success: true, data: newComponent }, { status: 201 });
    } catch (error) {
      logger.error('Error creating salary component:', error);
      return NextResponse.json({ success: false, error: 'Failed to create salary component' }, { status: 500 });
    }
  }
);

export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.COMPENSATION, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      return NextResponse.json({ success: true, data: { ...body, updatedAt: new Date().toISOString() } });
    } catch (error) {
      logger.error('Error updating salary component:', error);
      return NextResponse.json({ success: false, error: 'Failed to update salary component' }, { status: 500 });
    }
  }
);

export const DELETE = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.COMPENSATION, Action.DELETE, permissions);
      if (permissionError) return permissionError;

      return NextResponse.json({ success: true, message: 'Salary component deleted' });
    } catch (error) {
      logger.error('Error deleting salary component:', error);
      return NextResponse.json({ success: false, error: 'Failed to delete salary component' }, { status: 500 });
    }
  }
);
