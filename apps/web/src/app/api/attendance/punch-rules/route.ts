import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const PunchRuleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  applicableTo: z.enum(['ALL', 'DEPARTMENT', 'DESIGNATION', 'CUSTOM']),
  departments: z.array(z.string()).optional(),
  designations: z.array(z.string()).optional(),
  rules: z.object({
    allowEarlyCheckIn: z.boolean().default(true),
    earlyCheckInMinutes: z.number().default(60),
    allowLateCheckOut: z.boolean().default(true),
    lateCheckOutMinutes: z.number().default(120),
    requirePhoto: z.boolean().default(false),
    requireLocation: z.boolean().default(false),
    allowMultiplePunches: z.boolean().default(false),
    maxPunchesPerDay: z.number().default(2),
    minTimeBetweenPunches: z.number().default(60), // minutes
  }),
  isActive: z.boolean().default(true),
});

// GET - Fetch punch rules
export const GET = withEnhancedAuth(async (request: NextRequest, { user: _user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.ATTENDANCE, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    const mockPunchRules = [
      {
        id: '1',
        name: 'Standard Office Rule',
        description: 'Default punch rule for all office employees',
        applicableTo: 'ALL',
        rules: {
          allowEarlyCheckIn: true,
          earlyCheckInMinutes: 60,
          allowLateCheckOut: true,
          lateCheckOutMinutes: 120,
          requirePhoto: false,
          requireLocation: false,
          allowMultiplePunches: false,
          maxPunchesPerDay: 2,
          minTimeBetweenPunches: 60,
        },
        isActive: true,
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00',
      },
      {
        id: '2',
        name: 'Field Force Rule',
        description: 'Punch rule for field employees with location tracking',
        applicableTo: 'DEPARTMENT',
        departments: ['Sales', 'Field Operations'],
        rules: {
          allowEarlyCheckIn: true,
          earlyCheckInMinutes: 120,
          allowLateCheckOut: true,
          lateCheckOutMinutes: 180,
          requirePhoto: true,
          requireLocation: true,
          allowMultiplePunches: true,
          maxPunchesPerDay: 10,
          minTimeBetweenPunches: 30,
        },
        isActive: true,
        createdAt: '2024-02-01T00:00:00',
        updatedAt: '2024-02-15T00:00:00',
      },
      {
        id: '3',
        name: 'Strict Office Rule',
        description: 'Strict punch rule with photo verification',
        applicableTo: 'DESIGNATION',
        designations: ['Security', 'Compliance'],
        rules: {
          allowEarlyCheckIn: false,
          earlyCheckInMinutes: 0,
          allowLateCheckOut: false,
          lateCheckOutMinutes: 0,
          requirePhoto: true,
          requireLocation: true,
          allowMultiplePunches: false,
          maxPunchesPerDay: 2,
          minTimeBetweenPunches: 120,
        },
        isActive: false,
        createdAt: '2024-03-01T00:00:00',
        updatedAt: '2024-03-10T00:00:00',
      },
    ];

    let filteredData = mockPunchRules;
    if (isActive !== null) {
      filteredData = mockPunchRules.filter((r) => r.isActive === (isActive === 'true'));
    }

    return NextResponse.json({
      success: true,
      data: filteredData,
      meta: { total: filteredData.length },
    });
  } catch (error) {
    logger.error({ error }, '');
    return NextResponse.json(
      { success: false, error: 'Failed to fetch punch rules' },
      { status: 500 }
    );
  }
});

// POST - Create punch rule
export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.ATTENDANCE, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    const data = PunchRuleSchema.parse(body);

    const newRule = {
      id: crypto.randomUUID(),
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
        entityType: 'Attendance - Punch Rules',
        details: `Created punch rule: ${data.name}`,
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
      { success: false, error: 'Failed to create punch rule' },
      { status: 500 }
    );
  }
});

// PUT - Update punch rule
export const PUT = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.ATTENDANCE, Action.UPDATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Rule ID is required' }, { status: 400 });
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
        entityType: 'Attendance - Punch Rules',
        details: `Updated punch rule: ${id}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    logger.error({ error }, '');
    return NextResponse.json(
      { success: false, error: 'Failed to update punch rule' },
      { status: 500 }
    );
  }
});

// DELETE - Delete punch rule
export const DELETE = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.ATTENDANCE, Action.DELETE, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Rule ID is required' }, { status: 400 });
    }

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.userId,
        action: 'DELETE',
        entityType: 'Attendance - Punch Rules',
        details: `Deleted punch rule: ${id}`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({ success: true, message: 'Punch rule deleted successfully' });
  } catch (error) {
    logger.error({ error }, '');
    return NextResponse.json(
      { success: false, error: 'Failed to delete punch rule' },
      { status: 500 }
    );
  }
});
