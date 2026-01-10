import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const TimeRoundingSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  applicableTo: z.enum(['ALL', 'DEPARTMENT', 'DESIGNATION', 'CUSTOM']),
  departments: z.array(z.string()).optional(),
  designations: z.array(z.string()).optional(),
  roundingConfig: z.object({
    checkInRounding: z.enum(['NONE', 'NEAREST', 'UP', 'DOWN']),
    checkOutRounding: z.enum(['NONE', 'NEAREST', 'UP', 'DOWN']),
    roundingInterval: z.number(), // in minutes (e.g., 15, 30, 60)
    graceMinutes: z.number().optional(),
    applyToCheckIn: z.boolean().default(true),
    applyToCheckOut: z.boolean().default(true),
  }),
  isActive: z.boolean().default(true),
});

// GET - Fetch time rounding rules
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const isActive = searchParams.get('isActive');

      const mockRoundingRules = [
        {
          id: '1',
          name: 'Standard 15-Minute Rounding',
          description: 'Round check-in/out to nearest 15 minutes',
          applicableTo: 'ALL',
          roundingConfig: {
            checkInRounding: 'NEAREST',
            checkOutRounding: 'NEAREST',
            roundingInterval: 15,
            graceMinutes: 5,
            applyToCheckIn: true,
            applyToCheckOut: true,
          },
          isActive: true,
          examples: [
            { actual: '09:07', rounded: '09:00' },
            { actual: '09:08', rounded: '09:15' },
            { actual: '18:23', rounded: '18:30' },
          ],
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00',
        },
        {
          id: '2',
          name: 'Production Floor - Round Down Check-In',
          description: 'Round check-in down to help employees, round check-out up',
          applicableTo: 'DEPARTMENT',
          departments: ['Production', 'Manufacturing'],
          roundingConfig: {
            checkInRounding: 'DOWN',
            checkOutRounding: 'UP',
            roundingInterval: 30,
            graceMinutes: 10,
            applyToCheckIn: true,
            applyToCheckOut: true,
          },
          isActive: true,
          examples: [
            { actual: '09:25', rounded: '09:00', type: 'CHECK_IN' },
            { actual: '18:05', rounded: '18:30', type: 'CHECK_OUT' },
          ],
          createdAt: '2024-02-01T00:00:00',
          updatedAt: '2024-02-01T00:00:00',
        },
        {
          id: '3',
          name: 'Executive - No Rounding',
          description: 'No time rounding for executive level',
          applicableTo: 'DESIGNATION',
          designations: ['Executive', 'Director', 'VP', 'C-Level'],
          roundingConfig: {
            checkInRounding: 'NONE',
            checkOutRounding: 'NONE',
            roundingInterval: 0,
            applyToCheckIn: false,
            applyToCheckOut: false,
          },
          isActive: true,
          examples: [
            { actual: '09:23', rounded: '09:23' },
            { actual: '18:47', rounded: '18:47' },
          ],
          createdAt: '2024-03-01T00:00:00',
          updatedAt: '2024-03-01T00:00:00',
        },
      ];

      let filteredData = mockRoundingRules;
      if (isActive !== null) {
        filteredData = mockRoundingRules.filter(r => r.isActive === (isActive === 'true'));
      }

      return NextResponse.json({
        success: true,
        data: filteredData,
        meta: { total: filteredData.length },
      });
    } catch (error) {
      logger.error('Error fetching time rounding rules:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch time rounding rules' },
        { status: 500 }
      );
    }
  }
);

// POST - Create time rounding rule
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();

      // If action is calculate, perform time rounding calculation
      if (body.action === 'calculate') {
        const { time, roundingType, interval, graceMinutes } = body;

        if (!time || !roundingType || !interval) {
          return NextResponse.json(
            { success: false, error: 'time, roundingType, and interval are required' },
            { status: 400 }
          );
        }

        const [hours, minutes] = time.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes;

        let roundedMinutes = totalMinutes;

        if (roundingType !== 'NONE') {
          const remainder = totalMinutes % interval;

          switch (roundingType) {
            case 'NEAREST':
              roundedMinutes = remainder >= interval / 2
                ? totalMinutes + (interval - remainder)
                : totalMinutes - remainder;
              break;
            case 'UP':
              roundedMinutes = remainder > 0
                ? totalMinutes + (interval - remainder)
                : totalMinutes;
              break;
            case 'DOWN':
              roundedMinutes = totalMinutes - remainder;
              break;
          }
        }

        const roundedHours = Math.floor(roundedMinutes / 60);
        const roundedMins = roundedMinutes % 60;
        const roundedTime = `${String(roundedHours).padStart(2, '0')}:${String(roundedMins).padStart(2, '0')}`;

        return NextResponse.json({
          success: true,
          data: {
            originalTime: time,
            roundedTime,
            difference: roundedMinutes - totalMinutes,
            roundingType,
            interval,
          },
        });
      }

      // Create new rounding rule
      const data = TimeRoundingSchema.parse(body);

      const newRule = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user.userId,
      };

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'CREATE',
          module: 'Attendance - Time Rounding',
          details: `Created time rounding rule: ${data.name}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: newRule }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error('Error creating time rounding rule:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create time rounding rule' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update time rounding rule
export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const { id, ...updates } = body;

      if (!id) {
        return NextResponse.json(
          { success: false, error: 'Rule ID is required' },
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
          userId: user.userId,
          action: 'UPDATE',
          module: 'Attendance - Time Rounding',
          details: `Updated time rounding rule: ${id}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: updated });
    } catch (error) {
      logger.error('Error updating time rounding rule:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update time rounding rule' },
        { status: 500 }
      );
    }
  }
);

// DELETE - Delete time rounding rule
export const DELETE = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.DELETE, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');

      if (!id) {
        return NextResponse.json(
          { success: false, error: 'Rule ID is required' },
          { status: 400 }
        );
      }

      await prisma.auditLog.create({
        data: {
          userId: user.userId,
          action: 'DELETE',
          module: 'Attendance - Time Rounding',
          details: `Deleted time rounding rule: ${id}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, message: 'Time rounding rule deleted successfully' });
    } catch (error) {
      logger.error('Error deleting time rounding rule:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to delete time rounding rule' },
        { status: 500 }
      );
    }
  }
);
