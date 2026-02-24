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

      const { searchParams } = new URL(request.url);
      const isActive = searchParams.get('isActive');
      const search = searchParams.get('search');

      const where: Record<string, unknown> = { tenantId: user.tenantId };
      if (isActive !== null && isActive !== undefined && isActive !== '') {
        where.isActive = isActive === 'true';
      }
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
        ];
      }

      const shifts = await prisma.shift.findMany({
        where,
        include: {
          _count: {
            select: { assignments: true },
          },
        },
        orderBy: { name: 'asc' },
      });

      const data = shifts.map((shift) => ({
        id: shift.id,
        name: shift.name,
        code: shift.code,
        description: shift.description,
        startTime: shift.startTime,
        endTime: shift.endTime,
        gracePeriod: shift.graceInMinutes,
        halfDayHours: shift.workHours ? shift.workHours / 2 : 4,
        fullDayHours: shift.workHours || 8,
        breakDuration: shift.breakDuration,
        weeklyOff: shift.weekendDays,
        status: shift.isActive ? 'ACTIVE' : 'INACTIVE',
        employeeCount: shift._count.assignments,
        isFlexible: shift.isFlexible,
        flexWindow: shift.flexWindow,
        overtimeAllowed: shift.overtimeAllowed,
        maxOvertimeHours: shift.maxOvertimeHours,
        isDefault: shift.isDefault,
      }));

      return NextResponse.json({
        success: true,
        data,
        meta: { total: data.length },
      });
    } catch (error) {
      logger.error({ error }, '');
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

      const newShift = await prisma.shift.create({
        data: {
          tenantId: user.tenantId,
          code: data.code,
          name: data.name,
          startTime: data.startTime,
          endTime: data.endTime,
          graceInMinutes: data.gracePeriod,
          breakDuration: data.breakDuration,
          workHours: data.fullDayHours,
          weekendDays: data.weeklyOff.map(String),
          isActive: true,
        },
        include: {
          _count: {
            select: { assignments: true },
          },
        },
      });

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'CREATE',
          entityType: 'Attendance - Shift Management',
          details: `Created shift: ${data.name} (${data.code})`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      const responseData = {
        id: newShift.id,
        name: newShift.name,
        code: newShift.code,
        startTime: newShift.startTime,
        endTime: newShift.endTime,
        gracePeriod: newShift.graceInMinutes,
        halfDayHours: newShift.workHours ? newShift.workHours / 2 : 4,
        fullDayHours: newShift.workHours || 8,
        breakDuration: newShift.breakDuration,
        weeklyOff: newShift.weekendDays,
        status: 'ACTIVE',
        employeeCount: newShift._count.assignments,
      };

      return NextResponse.json({ success: true, data: responseData }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation error', details: error.errors },
          { status: 400 }
        );
      }
      logger.error({ error }, '');
      return NextResponse.json(
        { success: false, error: 'Failed to create shift' },
        { status: 500 }
      );
    }
  }
);
