import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.COMPENSATION, Action.READ, permissions);
      if (permissionError) return permissionError;

      const mockCompensation = [
        {
          id: 'empcomp-1',
          employeeId: user.userId,
          employeeName: user.name || 'John Doe',
          structureId: 'struct-1',
          annualCTC: 120000,
          monthlyCTC: 10000,
          effectiveFrom: '2024-01-01',
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];

      return NextResponse.json({ success: true, data: mockCompensation });
    } catch (error) {
      logger.error('Error fetching employee compensation:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch employee compensation' }, { status: 500 });
    }
  }
);

export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.COMPENSATION, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const newCompensation = {
        ...body,
        id: `empcomp-${Date.now()}`,
        isActive: true,
        createdAt: new Date().toISOString(),
      };

      return NextResponse.json({ success: true, data: newCompensation }, { status: 201 });
    } catch (error) {
      logger.error('Error creating employee compensation:', error);
      return NextResponse.json({ success: false, error: 'Failed to create employee compensation' }, { status: 500 });
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
      logger.error('Error updating employee compensation:', error);
      return NextResponse.json({ success: false, error: 'Failed to update employee compensation' }, { status: 500 });
    }
  }
);
