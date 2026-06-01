import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const createIDCardSchema = z.object({
  employeeId: z.string().min(1),
  templateId: z.string().optional(),
  cardNumber: z.string().optional(),
  cardType: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'ISSUED', 'EXPIRED', 'REVOKED']).optional().default('PENDING'),
  photoUrl: z.string().optional(),
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

    const cards = await prisma.iDCard.findMany({
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
        template: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ cards }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching ID cards:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const validated = createIDCardSchema.parse(body);

    const data: any = {
      ...validated,
      tenantId: user.tenantId,
    };

    if (validated.issueDate) {
      data.issueDate = new Date(validated.issueDate);
    }
    if (validated.expiryDate) {
      data.expiryDate = new Date(validated.expiryDate);
    }

    const card = await prisma.iDCard.create({
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
        template: true,
      },
    });

    return NextResponse.json({ card }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating ID card:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID card ID is required' }, { status: 400 });
    }

    const existing = await prisma.iDCard.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'ID card not found' }, { status: 404 });
    }

    if (data.issueDate) {
      data.issueDate = new Date(data.issueDate);
    }
    if (data.expiryDate) {
      data.expiryDate = new Date(data.expiryDate);
    }

    const card = await prisma.iDCard.update({
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
        template: true,
      },
    });

    return NextResponse.json({ card }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating ID card:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
