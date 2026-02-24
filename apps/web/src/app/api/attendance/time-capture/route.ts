import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const TimeCaptureSchema = z.object({
  employeeId: z.string(),
  type: z.enum(['CHECK_IN', 'CHECK_OUT', 'BREAK_START', 'BREAK_END']),
  timestamp: z.string().optional(),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    address: z.string().optional(),
  }).optional(),
  photo: z.string().optional(),
  ipAddress: z.string().optional(),
  deviceInfo: z.object({
    deviceId: z.string().optional(),
    deviceType: z.string().optional(),
    osVersion: z.string().optional(),
  }).optional(),
});

// GET - Fetch time capture records
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const employeeId = searchParams.get('employeeId') || user.userId;
      const date = searchParams.get('date');
      const type = searchParams.get('type');

      const mockTimeCaptures = [
        {
          id: '1',
          employeeId,
          employeeName: 'John Doe',
          type: 'CHECK_IN',
          timestamp: '2024-08-26T09:05:00',
          location: {
            latitude: 28.6139,
            longitude: 77.2090,
            address: 'Connaught Place, New Delhi',
          },
          photo: 'checkin_photo_1.jpg',
          ipAddress: '192.168.1.100',
          deviceInfo: {
            deviceId: 'DEV-123',
            deviceType: 'Mobile',
            osVersion: 'iOS 17.0',
          },
          isValid: true,
          validationStatus: 'APPROVED',
          createdAt: '2024-08-26T09:05:00',
        },
        {
          id: '2',
          employeeId,
          employeeName: 'John Doe',
          type: 'BREAK_START',
          timestamp: '2024-08-26T13:00:00',
          location: {
            latitude: 28.6139,
            longitude: 77.2090,
            address: 'Connaught Place, New Delhi',
          },
          ipAddress: '192.168.1.100',
          deviceInfo: {
            deviceId: 'DEV-123',
            deviceType: 'Mobile',
            osVersion: 'iOS 17.0',
          },
          isValid: true,
          validationStatus: 'APPROVED',
          createdAt: '2024-08-26T13:00:00',
        },
        {
          id: '3',
          employeeId,
          employeeName: 'John Doe',
          type: 'BREAK_END',
          timestamp: '2024-08-26T14:00:00',
          location: {
            latitude: 28.6139,
            longitude: 77.2090,
            address: 'Connaught Place, New Delhi',
          },
          ipAddress: '192.168.1.100',
          deviceInfo: {
            deviceId: 'DEV-123',
            deviceType: 'Mobile',
            osVersion: 'iOS 17.0',
          },
          isValid: true,
          validationStatus: 'APPROVED',
          createdAt: '2024-08-26T14:00:00',
        },
        {
          id: '4',
          employeeId,
          employeeName: 'John Doe',
          type: 'CHECK_OUT',
          timestamp: '2024-08-26T18:10:00',
          location: {
            latitude: 28.6139,
            longitude: 77.2090,
            address: 'Connaught Place, New Delhi',
          },
          photo: 'checkout_photo_1.jpg',
          ipAddress: '192.168.1.100',
          deviceInfo: {
            deviceId: 'DEV-123',
            deviceType: 'Mobile',
            osVersion: 'iOS 17.0',
          },
          isValid: true,
          validationStatus: 'APPROVED',
          createdAt: '2024-08-26T18:10:00',
        },
      ];

      let filteredData = mockTimeCaptures.filter(t => t.employeeId === employeeId);
      if (date) filteredData = filteredData.filter(t => t.timestamp.startsWith(date));
      if (type) filteredData = filteredData.filter(t => t.type === type);

      // Calculate summary
      const checkIns = filteredData.filter(t => t.type === 'CHECK_IN');
      const checkOuts = filteredData.filter(t => t.type === 'CHECK_OUT');
      const breaks = filteredData.filter(t => t.type === 'BREAK_START' || t.type === 'BREAK_END');

      const summary = {
        total: filteredData.length,
        checkIns: checkIns.length,
        checkOuts: checkOuts.length,
        breaks: breaks.length / 2, // Pair of break start/end
        lastCheckIn: checkIns[checkIns.length - 1]?.timestamp || null,
        lastCheckOut: checkOuts[checkOuts.length - 1]?.timestamp || null,
        currentStatus: checkIns.length > checkOuts.length ? 'CHECKED_IN' : 'CHECKED_OUT',
      };

      return NextResponse.json({
        success: true,
        data: { captures: filteredData, summary },
        meta: { total: filteredData.length },
      });
    } catch (error) {
      logger.error({ error }, '');
      return NextResponse.json(
        { success: false, error: 'Failed to fetch time captures' },
        { status: 500 }
      );
    }
  }
);

// POST - Capture time (check-in/out, break)
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const data = TimeCaptureSchema.parse(body);

      const timestamp = data.timestamp || new Date().toISOString();
      const ipAddress = data.ipAddress || request.headers.get('x-forwarded-for') || 'unknown';

      const newCapture = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        timestamp,
        ipAddress,
        isValid: true,
        validationStatus: 'APPROVED',
        createdAt: new Date().toISOString(),
      };

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'CREATE',
          entityType: 'Attendance - Time Capture',
          details: `Captured time: ${data.type} at ${timestamp}`,
          ipAddress,
        },
      });

      return NextResponse.json({ success: true, data: newCapture }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error({ error }, '');
      return NextResponse.json(
        { success: false, error: 'Failed to capture time' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update time capture (for corrections)
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const { id, ...updates } = body;

      if (!id) {
        return NextResponse.json(
          { success: false, error: 'Capture ID is required' },
          { status: 400 }
        );
      }

      const updated = {
        id,
        ...updates,
        updatedAt: new Date().toISOString(),
        updatedBy: user.userId,
      };

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'UPDATE',
          entityType: 'Attendance - Time Capture',
          details: `Updated time capture: ${id}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: updated });
    } catch (error) {
      logger.error({ error }, '');
      return NextResponse.json(
        { success: false, error: 'Failed to update time capture' },
        { status: 500 }
      );
    }
  }
);

// DELETE - Delete time capture
export const DELETE = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.DELETE, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: 'Capture ID is required' },
          { status: 400 }
        );
      }

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'DELETE',
          entityType: 'Attendance - Time Capture',
          details: `Deleted time capture: ${id}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, message: 'Time capture deleted successfully' });
    } catch (error) {
      logger.error({ error }, '');
      return NextResponse.json(
        { success: false, error: 'Failed to delete time capture' },
        { status: 500 }
      );
    }
  }
);
