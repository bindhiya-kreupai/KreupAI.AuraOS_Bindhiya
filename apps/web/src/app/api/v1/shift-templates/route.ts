import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

function generateShiftCode(): string {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `SHIFT-${dateStr}-${seq}`;
}

const createTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(300).optional().nullable(),
  icon: z.string().default('Briefcase'),
  accent: z.string().default('from-blue-500/15 to-blue-500/5 border-blue-500/30'),
  shiftCode: z.string().min(1).max(20).optional(),
  shiftName: z.string().min(1).max(100),
  shiftDescription: z.string().max(300).optional().nullable(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  workHours: z.number().positive(),
  graceInMinutes: z.number().int().min(0).default(15),
  graceOutMinutes: z.number().int().min(0).default(15),
  breakDuration: z.number().int().min(0).default(60),
  overtimeAllowed: z.boolean().default(true),
  maxOvertimeHours: z.number().min(0).default(4),
});

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  const { user, permissions } = context;
  if (!permissions.includes('shifts:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing shifts:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const templates = await (prisma as any).shiftTemplate.findMany({
      where: { tenantId: user.tenantId, isDeleted: false },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, data: templates });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to list shift templates' } },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  const { user, permissions } = context;
  if (!permissions.includes('shifts:create')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing shifts:create permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const body = await request.json();
    const parsed = createTemplateSchema.parse(body);

    if (!parsed.shiftCode) {
      parsed.shiftCode = generateShiftCode();
    }

    const template = await (prisma as any).shiftTemplate.create({
      data: {
        ...parsed,
        tenantId: user.tenantId,
        createdBy: user.userId,
      },
    });
    return NextResponse.json({ success: true, data: template }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E4001', message: 'Validation error', details: error.errors },
        },
        { status: 400 }
      );
    }
    if (error?.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E4091', message: 'A template with this name already exists' },
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to create shift template' } },
      { status: 500 }
    );
  }
});
