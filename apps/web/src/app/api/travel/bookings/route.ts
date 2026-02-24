import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.TRAVEL, Action.READ, permissions);
      if (permissionError) return permissionError;

      return NextResponse.json({
        success: true,
        data: {
          bookings: [],
          tenantId: user.tenantId,
        },
      });
    } catch (error) {
      logger.error('Error fetching bookings:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch bookings' }, { status: 500 });
    }
  }
);

export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.TRAVEL, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const newBooking = {
        ...body,
        id: `booking-${Date.now()}`,
        tenantId: user.tenantId,
        bookedBy: user.userId,
        createdAt: new Date().toISOString(),
      };

      return NextResponse.json({ success: true, data: newBooking }, { status: 201 });
    } catch (error) {
      logger.error('Error creating booking:', error);
      return NextResponse.json({ success: false, error: 'Failed to create booking' }, { status: 500 });
    }
  }
);
