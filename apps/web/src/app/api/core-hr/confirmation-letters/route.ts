import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const createConfirmationLetterSchema = z.object({
  employeeId: z.string().min(1),
  templateId: z.string().optional(),
  subject: z.string().min(1),
  content: z.string().optional(),
  generatedPdfUrl: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING', 'APPROVED', 'ISSUED']).optional().default('DRAFT'),
  issuedAt: z.string().optional(),
});

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');

    const where: any = {
      tenantId: user.tenantId,
      letterType: 'CONFIRMATION',
    };

    if (status) {
      where.status = status;
    }

    if (employeeId) {
      where.employeeId = employeeId;
    }

    const letters = await prisma.letter.findMany({
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

    return NextResponse.json({ letters }, { status: 200 });
  } catch (error) {
    console.error('Error fetching confirmation letters:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const validated = createConfirmationLetterSchema.parse(body);

    const data: any = {
      ...validated,
      letterType: 'CONFIRMATION',
      tenantId: user.tenantId,
      createdBy: user.userId,
    };

    if (validated.issuedAt) {
      data.issuedAt = new Date(validated.issuedAt);
    }

    const letter = await prisma.letter.create({
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

    return NextResponse.json({ letter }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating confirmation letter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Letter ID is required' }, { status: 400 });
    }

    const existing = await prisma.letter.findFirst({
      where: { id, tenantId: user.tenantId, letterType: 'CONFIRMATION' },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Confirmation letter not found' }, { status: 404 });
    }

    if (data.issuedAt) {
      data.issuedAt = new Date(data.issuedAt);
    }

    const letter = await prisma.letter.update({
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

    return NextResponse.json({ letter }, { status: 200 });
  } catch (error) {
    console.error('Error updating confirmation letter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
