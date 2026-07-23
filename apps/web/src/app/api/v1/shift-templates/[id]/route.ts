import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(300).optional().nullable(),
  icon: z.string().optional(),
  accent: z.string().optional(),
  shiftCode: z.string().min(1).max(20).optional(),
  shiftName: z.string().min(1).max(100).optional(),
  shiftDescription: z.string().max(300).optional().nullable(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  workHours: z.number().positive().optional(),
  graceInMinutes: z.number().int().min(0).optional(),
  graceOutMinutes: z.number().int().min(0).optional(),
  breakDuration: z.number().int().min(0).optional(),
  overtimeAllowed: z.boolean().optional(),
  maxOvertimeHours: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
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
    const { id } = context.params;
    const template = await (prisma as any).shiftTemplate.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!template) {
      return NextResponse.json(
        { success: false, error: { code: 'E4041', message: 'Shift template not found' } },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: template });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to get shift template' } },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  const { user, permissions } = context;
  if (!permissions.includes('shifts:update')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing shifts:update permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const { id } = context.params;
    const existing = await (prisma as any).shiftTemplate.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'E4041', message: 'Shift template not found' } },
        { status: 404 }
      );
    }
    const body = await request.json();
    const parsed = updateTemplateSchema.parse(body);
    const template = await (prisma as any).shiftTemplate.update({
      where: { id },
      data: { ...parsed, updatedBy: user.userId },
    });
    return NextResponse.json({ success: true, data: template });
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
      { success: false, error: { code: 'E5001', message: 'Failed to update shift template' } },
      { status: 500 }
    );
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, context: any) => {
  const { user, permissions } = context;
  if (!permissions.includes('shifts:delete')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing shifts:delete permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const { id } = context.params;
    const existing = await (prisma as any).shiftTemplate.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: 'E4041', message: 'Shift template not found' } },
        { status: 404 }
      );
    }
    await (prisma as any).shiftTemplate.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date(), updatedBy: user.userId },
    });
    return NextResponse.json({ success: true, data: null });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to delete shift template' } },
      { status: 500 }
    );
  }
});
