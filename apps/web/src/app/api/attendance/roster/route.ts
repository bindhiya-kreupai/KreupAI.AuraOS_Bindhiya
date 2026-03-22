import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const RosterSchema = z.object({
  employeeId: z.string(),
  shiftId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  isRecurring: z.boolean().default(false),
  recurringDays: z.array(z.number()).optional(),
});

// GET - Fetch roster assignments
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const employeeId = searchParams.get('employeeId');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');

      const mockRosters = [
        {
          id: '1',
          employeeId: 'emp-1',
          employeeName: 'John Doe',
          shiftId: '1',
          shiftName: 'General Shift',
          shiftTime: '09:00 - 18:00',
          startDate: '2024-08-01',
          endDate: '2024-08-31',
          isRecurring: true,
          recurringDays: [1, 2, 3, 4, 5],
          status: 'ACTIVE',
        },
        {
          id: '2',
          employeeId: 'emp-2',
          employeeName: 'Jane Smith',
          shiftId: '2',
          shiftName: 'Night Shift',
          shiftTime: '22:00 - 06:00',
          startDate: '2024-08-01',
          endDate: '2024-08-31',
          isRecurring: true,
          recurringDays: [1, 2, 3, 4, 5],
          status: 'ACTIVE',
        },
      ];

      let filteredData = mockRosters;
      if (employeeId) {
        filteredData = mockRosters.filter(r => r.employeeId === employeeId);
      }
      if (startDate) {
        filteredData = filteredData.filter(r => !r.endDate || r.endDate >= startDate);
      }
      if (endDate) {
        filteredData = filteredData.filter(r => !r.startDate || r.startDate <= endDate);
      }

      return NextResponse.json({
        success: true,
        data: filteredData,
        meta: { total: filteredData.length },
      });
    } catch (error) {
      logger.error({ error }, '');
      return NextResponse.json(
        { success: false, error: 'Failed to fetch rosters' },
        { status: 500 }
      );
    }
  }
);

// POST - Create roster assignment
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const data = RosterSchema.parse({
        employeeId: body.employeeId,
        shiftId: body.shiftId,
        startDate: body.startDate || body.date,
        endDate: body.endDate || body.date || body.startDate,
        isRecurring: body.isRecurring,
        recurringDays: body.recurringDays,
      });

      const newRoster = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        createdBy: user.userId,
      };

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'CREATE',
          entityType: 'Attendance - Roster Assignment',
          details: `Assigned roster for employee ${data.employeeId}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: newRoster }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error({ error }, '');
      return NextResponse.json(
        { success: false, error: 'Failed to create roster' },
        { status: 500 }
      );
    }
  }
);
