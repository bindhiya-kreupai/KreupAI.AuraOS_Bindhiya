import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const createLifeEventSchema = z.object({
  employeeId: z.string().min(1),
  eventType: z.enum(['MARRIAGE', 'BIRTH', 'ADOPTION', 'DEATH', 'DIVORCE', 'DISABILITY', 'OTHER']),
  eventDate: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  relatedPersonName: z.string().optional(),
  relatedPersonRelation: z.string().optional(),
  documentUrl: z.string().optional(),
  verified: z.boolean().optional().default(false),
  impactsPayroll: z.boolean().optional().default(false),
  impactsBenefits: z.boolean().optional().default(false),
  impactsTax: z.boolean().optional().default(false),
  status: z.string().optional().default('PENDING'),
});

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    const where: any = {
      tenantId: user.tenantId,
    };

    if (employeeId) {
      where.employeeId = employeeId;
    }

    const events = await prisma.employeeLifeEvent.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
      orderBy: { eventDate: 'desc' },
    });

    return NextResponse.json({ events }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching life events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const validated = createLifeEventSchema.parse(body);

    const event = await prisma.employeeLifeEvent.create({
      data: {
        ...validated,
        eventDate: new Date(validated.eventDate),
        tenantId: user.tenantId,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating life event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    // Ensure the event belongs to this tenant
    const existing = await prisma.employeeLifeEvent.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Life event not found' }, { status: 404 });
    }

    if (data.eventDate) {
      data.eventDate = new Date(data.eventDate);
    }

    const event = await prisma.employeeLifeEvent.update({
      where: { id },
      data,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
          },
        },
      },
    });

    return NextResponse.json({ event }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating life event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
