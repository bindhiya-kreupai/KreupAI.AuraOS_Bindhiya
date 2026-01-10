import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const ShiftSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  startTime: z.string(),
  endTime: z.string(),
  gracePeriod: z.number().default(15),
  halfDayHours: z.number().default(4),
  fullDayHours: z.number().default(8),
  breakDuration: z.number().default(60),
  weeklyOff: z.array(z.number()).default([0, 6]),
});

// GET - Fetch shifts
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const mockShifts = [
        {
          id: '1',
          name: 'General Shift',
          code: 'GEN',
          startTime: '09:00',
          endTime: '18:00',
          gracePeriod: 15,
          halfDayHours: 4,
          fullDayHours: 8,
          breakDuration: 60,
          weeklyOff: [0, 6],
          status: 'ACTIVE',
          employeeCount: 45,
        },
        {
          id: '2',
          name: 'Night Shift',
          code: 'NIGHT',
          startTime: '22:00',
          endTime: '06:00',
          gracePeriod: 15,
          halfDayHours: 4,
          fullDayHours: 8,
          breakDuration: 60,
          weeklyOff: [0, 6],
          status: 'ACTIVE',
          employeeCount: 12,
        },
        {
          id: '3',
          name: 'Flexible Shift',
          code: 'FLEX',
          startTime: '10:00',
          endTime: '19:00',
          gracePeriod: 30,
          halfDayHours: 4,
          fullDayHours: 8,
          breakDuration: 60,
          weeklyOff: [0, 6],
          status: 'ACTIVE',
          employeeCount: 28,
        },
      ];

      return NextResponse.json({
        success: true,
        data: mockShifts,
        meta: { total: mockShifts.length },
      });
    } catch (error) {
      logger.error('Error fetching shifts:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch shifts' },
        { status: 500 }
      );
    }
  }
);

// POST - Create shift
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const data = ShiftSchema.parse(body);

      const newShift = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        status: 'ACTIVE',
        employeeCount: 0,
        createdAt: new Date().toISOString(),
        createdBy: user.userId,
      };

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Attendance - Shift Management',
          details: `Created shift: ${data.name} (${data.code})`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: newShift }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error('Error creating shift:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create shift' },
        { status: 500 }
      );
    }
  }
);
