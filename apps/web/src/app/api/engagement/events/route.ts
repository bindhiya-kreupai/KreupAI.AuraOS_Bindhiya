import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

function getDefaultEvents(tenantId: string) {
  return [
    {
      id: `event-${tenantId}-001`,
      title: 'Team Building Workshop',
      description: 'Quarterly team building activity',
      type: 'team_building',
      status: 'published',
      startDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000).toISOString(),
      location: 'Main Office',
      capacity: 50,
      registeredCount: 0,
      tenantId,
      createdBy: 'system',
      createdAt: new Date().toISOString(),
    },
  ];
}

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ENGAGEMENT, Action.READ, permissions);
      if (permissionError) return permissionError;

      const events = getDefaultEvents(user.tenantId);

      return NextResponse.json({ success: true, data: events });
    } catch (error) {
      logger.error('Error fetching events:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch events' }, { status: 500 });
    }
  }
);

export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ENGAGEMENT, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const newEvent = {
        ...body,
        id: `event-${Date.now()}`,
        tenantId: user.tenantId,
        createdBy: user.userId,
        createdAt: new Date().toISOString(),
      };

      return NextResponse.json({ success: true, data: newEvent }, { status: 201 });
    } catch (error) {
      logger.error('Error creating event:', error);
      return NextResponse.json({ success: false, error: 'Failed to create event' }, { status: 500 });
    }
  }
);

export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ENGAGEMENT, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      return NextResponse.json({ success: true, data: { ...body, tenantId: user.tenantId, lastModified: new Date().toISOString(), modifiedBy: user.userId } });
    } catch (error) {
      logger.error('Error updating event:', error);
      return NextResponse.json({ success: false, error: 'Failed to update event' }, { status: 500 });
    }
  }
);
