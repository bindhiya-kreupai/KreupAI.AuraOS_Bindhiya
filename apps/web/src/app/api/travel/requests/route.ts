import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.TRAVEL, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const employeeId = searchParams.get('employeeId') || user.userId;
      const status = searchParams.get('status');

      const mockRequests = [
        {
          id: 'travel-1',
          requestNumber: 'TR-2024-001',
          employeeId,
          employeeName: user.name || 'John Doe',
          purpose: 'Client Meeting',
          destination: 'New York',
          departureDate: '2024-03-15',
          returnDate: '2024-03-17',
          estimatedCost: 2500,
          status: 'approved',
          createdAt: new Date().toISOString(),
        },
      ];

      let filtered = mockRequests;
      if (status) filtered = filtered.filter(r => r.status === status);

      return NextResponse.json({ success: true, data: filtered });
    } catch {
      logger.error('Error fetching travel requests:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch travel requests' }, { status: 500 });
    }
  }
);

export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.TRAVEL, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const newRequest = {
        ...body,
        id: `travel-${Date.now()}`,
        requestNumber: `TR-${Date.now()}`,
        employeeId: user.userId,
        employeeName: user.name,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      return NextResponse.json({ success: true, data: newRequest }, { status: 201 });
    } catch {
      logger.error('Error creating travel request:', error);
      return NextResponse.json({ success: false, error: 'Failed to create travel request' }, { status: 500 });
    }
  }
);

export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.TRAVEL, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      return NextResponse.json({ success: true, data: { ...body, lastModified: new Date().toISOString() } });
    } catch {
      logger.error('Error updating travel request:', error);
      return NextResponse.json({ success: false, error: 'Failed to update travel request' }, { status: 500 });
    }
  }
);
