import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const createProbationSchema = z.object({
  employeeId: z.string().min(1),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  extendedEndDate: z.string().optional(),
  status: z.enum(['ACTIVE', 'EXTENDED', 'CONFIRMED', 'TERMINATED']).optional().default('ACTIVE'),
  performanceRating: z.number().optional(),
  managerRecommendation: z.string().optional(),
  hrRecommendation: z.string().optional(),
  finalDecision: z.string().optional(),
});

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');

    const where: any = {
      tenantId: user.tenantId,
    };

    if (status) {
      where.status = status;
    }

    if (employeeId) {
      where.employeeId = employeeId;
    }

    const records = await prisma.probationTracking.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: true,
          },
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json({ records }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching probation records:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const validated = createProbationSchema.parse(body);

    const data: any = {
      ...validated,
      tenantId: user.tenantId,
      startDate: new Date(validated.startDate),
      endDate: new Date(validated.endDate),
    };

    if (validated.extendedEndDate) {
      data.extendedEndDate = new Date(validated.extendedEndDate);
    }

    const record = await prisma.probationTracking.create({
      data,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: true,
          },
        },
      },
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating probation record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Probation record ID is required' }, { status: 400 });
    }

    const existing = await prisma.probationTracking.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Probation record not found' }, { status: 404 });
    }

    if (data.startDate) {
      data.startDate = new Date(data.startDate);
    }
    if (data.endDate) {
      data.endDate = new Date(data.endDate);
    }
    if (data.extendedEndDate) {
      data.extendedEndDate = new Date(data.extendedEndDate);
    }

    const record = await prisma.probationTracking.update({
      where: { id },
      data,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: true,
          },
        },
      },
    });

    return NextResponse.json({ record }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating probation record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
