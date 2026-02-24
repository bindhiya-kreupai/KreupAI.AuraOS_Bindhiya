import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const AttendanceRuleSchema = z.object({
  name: z.string().min(1),
  category: z.enum(['GENERAL', 'OVERTIME', 'LEAVE', 'SHIFT', 'COMPLIANCE']),
  description: z.string().optional(),
  applicableTo: z.enum(['ALL', 'DEPARTMENT', 'DESIGNATION', 'LOCATION', 'CUSTOM']),
  departments: z.array(z.string()).optional(),
  designations: z.array(z.string()).optional(),
  locations: z.array(z.string()).optional(),
  ruleConfig: z.object({
    gracePeriodMinutes: z.number().optional(),
    halfDayThresholdHours: z.number().optional(),
    fullDayThresholdHours: z.number().optional(),
    overtimeThresholdMinutes: z.number().optional(),
    automaticOvertimeApproval: z.boolean().optional(),
    weeklyOffDays: z.array(z.number()).optional(),
    consecutiveAbsencesAlert: z.number().optional(),
    lateArrivalThreshold: z.number().optional(),
    earlyDepartureThreshold: z.number().optional(),
  }),
  priority: z.number().default(0),
  isActive: z.boolean().default(true),
});

// GET - Fetch attendance rules
export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
      if (permissionError) return permissionError;

      const { searchParams } = new URL(request.url);
      const category = searchParams.get('category');
      const isActive = searchParams.get('isActive');

      const mockRules = [
        {
          id: '1',
          name: 'Standard Attendance Policy',
          category: 'GENERAL',
          description: 'Default attendance policy for all employees',
          applicableTo: 'ALL',
          ruleConfig: {
            gracePeriodMinutes: 15,
            halfDayThresholdHours: 4,
            fullDayThresholdHours: 8,
            overtimeThresholdMinutes: 480,
            automaticOvertimeApproval: false,
            weeklyOffDays: [0, 6],
            consecutiveAbsencesAlert: 3,
            lateArrivalThreshold: 15,
            earlyDepartureThreshold: 30,
          },
          priority: 1,
          isActive: true,
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00',
        },
        {
          id: '2',
          name: 'Engineering Department Overtime Rule',
          category: 'OVERTIME',
          description: 'Overtime approval rules for engineering team',
          applicableTo: 'DEPARTMENT',
          departments: ['Engineering'],
          ruleConfig: {
            overtimeThresholdMinutes: 480,
            automaticOvertimeApproval: true,
          },
          priority: 2,
          isActive: true,
          createdAt: '2024-02-01T00:00:00',
          updatedAt: '2024-02-01T00:00:00',
        },
        {
          id: '3',
          name: 'Shift Workers Policy',
          category: 'SHIFT',
          description: 'Attendance rules for shift-based employees',
          applicableTo: 'DESIGNATION',
          designations: ['Production Worker', 'Security Guard'],
          ruleConfig: {
            gracePeriodMinutes: 5,
            halfDayThresholdHours: 4,
            fullDayThresholdHours: 8,
            lateArrivalThreshold: 5,
            earlyDepartureThreshold: 15,
          },
          priority: 3,
          isActive: true,
          createdAt: '2024-03-01T00:00:00',
          updatedAt: '2024-03-01T00:00:00',
        },
        {
          id: '4',
          name: 'Remote Location Flexibility',
          category: 'GENERAL',
          description: 'Flexible attendance for remote locations',
          applicableTo: 'LOCATION',
          locations: ['Remote - USA', 'Remote - India'],
          ruleConfig: {
            gracePeriodMinutes: 30,
            halfDayThresholdHours: 4,
            fullDayThresholdHours: 8,
            lateArrivalThreshold: 30,
            earlyDepartureThreshold: 60,
          },
          priority: 2,
          isActive: true,
          createdAt: '2024-04-01T00:00:00',
          updatedAt: '2024-04-01T00:00:00',
        },
      ];

      let filteredData = mockRules;
      if (category) filteredData = filteredData.filter(r => r.category === category);
      if (isActive !== null) filteredData = filteredData.filter(r => r.isActive === (isActive === 'true'));

      const categorySummary = {
        general: filteredData.filter(r => r.category === 'GENERAL').length,
        overtime: filteredData.filter(r => r.category === 'OVERTIME').length,
        leave: filteredData.filter(r => r.category === 'LEAVE').length,
        shift: filteredData.filter(r => r.category === 'SHIFT').length,
        compliance: filteredData.filter(r => r.category === 'COMPLIANCE').length,
      };

      return NextResponse.json({
        success: true,
        data: { rules: filteredData, categorySummary },
        meta: { total: filteredData.length },
      });
    } catch (error) {
      logger.error({ error }, '');
      return NextResponse.json(
        { success: false, error: 'Failed to fetch attendance rules' },
        { status: 500 }
      );
    }
  }
);

// POST - Create attendance rule
export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ATTENDANCE, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const data = AttendanceRuleSchema.parse(body);

      const newRule = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: user.userId,
      };

      await prisma.auditLog.create({
        data: {
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'CREATE',
          entityType: 'Attendance - Rules',
          details: `Created attendance rule: ${data.name}`,
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
      logger.error({ error }, '');
      return NextResponse.json(
        { success: false, error: 'Failed to create attendance rule' },
        { status: 500 }
      );
    }
  }
);

// PUT - Update attendance rule
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
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'UPDATE',
          entityType: 'Attendance - Rules',
          details: `Updated attendance rule: ${id}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, data: updated });
    } catch (error) {
      logger.error({ error }, '');
      return NextResponse.json(
        { success: false, error: 'Failed to update attendance rule' },
        { status: 500 }
      );
    }
  }
);

// DELETE - Delete attendance rule
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
          tenantId: user.tenantId,
          userId: user.userId,
          action: 'DELETE',
          entityType: 'Attendance - Rules',
          details: `Deleted attendance rule: ${id}`,
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        },
      });

      return NextResponse.json({ success: true, message: 'Attendance rule deleted successfully' });
    } catch (error) {
      logger.error({ error }, '');
      return NextResponse.json(
        { success: false, error: 'Failed to delete attendance rule' },
        { status: 500 }
      );
    }
  }
);
