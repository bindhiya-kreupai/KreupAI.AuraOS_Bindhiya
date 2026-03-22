import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const TimeCaptureSchema = z.object({
  employeeId: z.string().optional(),
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

function buildLocationString(location?: {
  latitude?: number;
  longitude?: number;
  address?: string;
}): string | null {
  if (!location) {
    return null;
  }

  const parts: string[] = [];
  if (location.latitude != null && location.longitude != null) {
    parts.push(`${location.latitude},${location.longitude}`);
  }
  if (location.address) {
    parts.push(location.address);
  }

  return parts.length > 0 ? parts.join(' - ') : null;
}

function parseLocation(location?: string | null) {
  if (!location) {
    return undefined;
  }

  const [coordinates, ...addressParts] = location.split(' - ');
  const [latitude, longitude] = coordinates.split(',').map(Number);
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);

  return {
    latitude: hasCoordinates ? latitude : undefined,
    longitude: hasCoordinates ? longitude : undefined,
    address: addressParts.length > 0 ? addressParts.join(' - ') : location,
  };
}

function mapCapture(
  punch: {
    id: string;
    employeeId: string;
    punchType: string;
    punchTime: Date;
    location?: string | null;
    photo?: string | null;
    ipAddress?: string | null;
    device?: string | null;
    notes?: string | null;
    isVerified?: boolean;
    createdAt: Date;
  },
  employeeName?: string
) {
  return {
    id: punch.id,
    employeeId: punch.employeeId,
    employeeName: employeeName || 'Unknown Employee',
    type: punch.punchType,
    timestamp: punch.punchTime.toISOString(),
    location: parseLocation(punch.location),
    photo: punch.photo || null,
    ipAddress: punch.ipAddress || null,
    deviceInfo: {
      deviceType: punch.device || null,
    },
    isValid: punch.isVerified ?? false,
    validationStatus: punch.isVerified ? 'APPROVED' : 'PENDING',
    createdAt: punch.createdAt.toISOString(),
    notes: punch.notes || null,
  };
}

// GET - Fetch time capture records
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const employeeId = searchParams.get('employeeId') || user.employeeId || user.userId;
      const date = searchParams.get('date');
      const type = searchParams.get('type');

      const where: Record<string, unknown> = {
        tenantId: user.tenantId,
        isDeleted: false,
      };

      if (employeeId) {
        where.employeeId = employeeId;
      }

      if (date) {
        const start = new Date(date);
        const end = new Date(date);
        end.setDate(end.getDate() + 1);
        where.punchDate = { gte: start, lt: end };
      }

      if (type) {
        where.punchType = type;
      }

      const punches = await prisma.attendancePunch.findMany({
        where,
        orderBy: { punchTime: 'asc' },
      });

      const employeeIds = [...new Set(punches.map((p) => p.employeeId))];
      const employees = employeeIds.length
        ? await prisma.employee.findMany({
            where: { id: { in: employeeIds } },
            select: { id: true, firstName: true, lastName: true },
          })
        : [];
      const employeeMap = new Map(
        employees.map((employee) => [employee.id, `${employee.firstName} ${employee.lastName}`])
      );

      const filteredData = punches.map((punch) => mapCapture(punch, employeeMap.get(punch.employeeId)));

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

      const employeeId =
        data.employeeId && data.employeeId !== 'current-user' && data.employeeId !== 'current-user-id'
          ? data.employeeId
          : user.employeeId || user.userId;

      if (!employeeId) {
        return NextResponse.json(
          { success: false, error: 'employeeId is required' },
          { status: 400 }
        );
      }

      const punchTime = new Date(timestamp);
      const punchDate = new Date(
        punchTime.getFullYear(),
        punchTime.getMonth(),
        punchTime.getDate()
      );

      const created = await prisma.attendancePunch.create({
        data: {
          tenantId: user.tenantId,
          employeeId,
          punchDate,
          punchTime,
          punchType: data.type,
          location: buildLocationString(data.location),
          device: data.deviceInfo?.deviceType || 'WEB',
          ipAddress,
          photo: data.photo || null,
          notes: null,
          isVerified: true,
          createdBy: user.id || user.userId || null,
        },
      });

      if (data.type === 'CHECK_IN' || data.type === 'CHECK_OUT') {
        const existingRecord = await prisma.attendanceRecord.findFirst({
          where: {
            tenantId: user.tenantId,
            employeeId,
            date: punchDate,
          },
        });

        if (existingRecord) {
          await prisma.attendanceRecord.update({
            where: { id: existingRecord.id },
            data: {
              ...(data.type === 'CHECK_IN' && !existingRecord.clockIn ? { clockIn: punchTime } : {}),
              ...(data.type === 'CHECK_OUT' ? { clockOut: punchTime } : {}),
              status: 'PRESENT',
            },
          });
        } else if (data.type === 'CHECK_IN') {
          await prisma.attendanceRecord.create({
            data: {
              tenantId: user.tenantId,
              employeeId,
              date: punchDate,
              clockIn: punchTime,
              status: 'PRESENT',
              approvalStatus: 'PENDING',
            },
          });
        }
      }

      const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        select: { firstName: true, lastName: true },
      });

      const newCapture = mapCapture(
        created,
        employee ? `${employee.firstName} ${employee.lastName}` : undefined
      );

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.id || user.userId,
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
        updatedBy: user.id || user.userId,
      };

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.id || user.userId,
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
          userId: user.id || user.userId,
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
