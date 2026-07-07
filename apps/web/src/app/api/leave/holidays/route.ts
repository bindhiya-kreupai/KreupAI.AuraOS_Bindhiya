import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const HolidaySchema = z.object({
  name: z.string().min(1),
  date: z.string(), // YYYY-MM-DD
  type: z.string().default('National'), // National, Regional
  status: z.string().default('Active'),
});

// GET - Fetch holidays from database
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.LEAVE, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear().toString();
    const type = searchParams.get('type');

    // Holiday model has no tenantId - it's global
    const where: Record<string, unknown> = {};
    if (type) {
      where.type = type;
    }

    // Filter by year using date string pattern (date is stored as YYYY-MM-DD string)
    where.date = {
      startsWith: year,
    };

    const holidays = await prisma.holiday.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    const summary = {
      total: holidays.length,
      national: holidays.filter((h) => h.type === 'National').length,
      regional: holidays.filter((h) => h.type === 'Regional').length,
    };

    return NextResponse.json({
      success: true,
      holidays,
      data: { holidays, summary },
    });
  } catch (error: any) {
    logger.error('Error fetching holidays:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch holidays' },
      { status: 500 }
    );
  }
});

// POST - Create holiday in database
export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.LEAVE, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    const data = HolidaySchema.parse(body);

    const newHoliday = await prisma.holiday.create({
      data: {
        name: data.name,
        date: data.date,
        type: data.type,
        status: data.status,
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.userId,
        action: 'CREATE',
        module: 'LEAVE',
        resourceType: 'Leave - Holiday Management',
        metadata: { description: `Created holiday: ${data.name} on ${data.date}` } as any,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json(
      { success: true, data: newHoliday, holiday: newHoliday },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Error creating holiday:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create holiday' },
      { status: 500 }
    );
  }
});
