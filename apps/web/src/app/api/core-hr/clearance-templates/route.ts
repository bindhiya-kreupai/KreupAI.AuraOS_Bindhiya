import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const createTemplateSchema = z.object({
  department: z.string().min(1),
  description: z.string().min(1),
  sortOrder: z.number().int().optional(),
});

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const templates = await (prisma as any).clearanceTemplate.findMany({
      where: { tenantId: user.tenantId, isDeleted: false, isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { department: 'asc' }],
    });
    return NextResponse.json({ templates }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching clearance templates:', error);
    return NextResponse.json(
      { error: 'Internal server error', messageAr: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();
    const validated = createTemplateSchema.parse(body);

    const template = await (prisma as any).clearanceTemplate.create({
      data: {
        tenantId: user.tenantId,
        department: validated.department,
        description: validated.description,
        sortOrder: validated.sortOrder ?? 0,
        createdBy: user.userId,
      },
    });

    return NextResponse.json({ template }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', messageAr: 'فشل التحقق', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating clearance template:', error);
    return NextResponse.json(
      { error: 'Internal server error', messageAr: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
});
