import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const createExitSchema = z.object({
  employeeId: z.string().min(1),
  exitType: z.enum(['RESIGNATION', 'TERMINATION', 'RETIREMENT', 'CONTRACT_END']),
  resignationDate: z.string().optional(),
  lastWorkingDate: z.string().optional(),
  noticePeriodDays: z.number().optional(),
  reason: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED']).optional().default('PENDING'),
  clearanceStatus: z.string().optional(),
  settlementAmount: z.number().optional(),
  rehireEligible: z.boolean().optional(),
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

    const exits = await prisma.exitRequest.findMany({
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
        clearances: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ exits }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching exit requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const validated = createExitSchema.parse(body);

    const data: any = {
      ...validated,
      tenantId: user.tenantId,
    };

    if (validated.resignationDate) {
      data.resignationDate = new Date(validated.resignationDate);
    }
    if (validated.lastWorkingDate) {
      data.lastWorkingDate = new Date(validated.lastWorkingDate);
    }

    const exit = await prisma.exitRequest.create({
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
        clearances: true,
      },
    });

    return NextResponse.json({ exit }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating exit request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Exit request ID is required' }, { status: 400 });
    }

    // Ensure the exit request belongs to this tenant
    const existing = await prisma.exitRequest.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Exit request not found' }, { status: 404 });
    }

    if (data.resignationDate) {
      data.resignationDate = new Date(data.resignationDate);
    }
    if (data.lastWorkingDate) {
      data.lastWorkingDate = new Date(data.lastWorkingDate);
    }

    const exit = await prisma.exitRequest.update({
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
        clearances: true,
      },
    });

    return NextResponse.json({ exit }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating exit request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
