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

      const mockEvents = [
        {
          id: 'event-1',
          title: 'Team Building Workshop',
          description: 'Quarterly team building activity',
          type: 'team_building',
          status: 'published',
          startDateTime: '2024-02-15T10:00:00Z',
          endDateTime: '2024-02-15T17:00:00Z',
          location: 'Main Office',
          capacity: 50,
          registeredCount: 35,
          createdAt: new Date().toISOString(),
        },
      ];

      return NextResponse.json({ success: true, data: mockEvents });
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
      const newEvent = { ...body, id: `event-${Date.now()}`, createdAt: new Date().toISOString() };

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
      return NextResponse.json({ success: true, data: { ...body, lastModified: new Date().toISOString() } });
    } catch (error) {
      logger.error('Error updating event:', error);
      return NextResponse.json({ success: false, error: 'Failed to update event' }, { status: 500 });
    }
  }
);
