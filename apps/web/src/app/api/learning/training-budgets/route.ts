import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.LEARNING, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const fiscalYear = searchParams.get('fiscalYear');
    const departmentId = searchParams.get('departmentId');

    const where: Record<string, unknown> = { tenantId: user.tenantId, isDeleted: false };
    if (fiscalYear) where.fiscalYear = fiscalYear;
    if (departmentId) where.departmentId = departmentId;

    const budgets = await prisma.trainingBudget.findMany({
      where,
      orderBy: [{ fiscalYear: 'desc' }, { departmentName: 'asc' }],
    });

    return NextResponse.json({ success: true, data: budgets });
  } catch (error: unknown) {
    logger.error({ err: error }, 'Error fetching training budgets');
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch training budgets',
        messageAr: 'فشل في جلب ميزانيات التدريب',
      },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.LEARNING, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    if (!body.fiscalYear) {
      return NextResponse.json(
        { success: false, message: 'Fiscal year is required', messageAr: 'السنة المالية مطلوبة' },
        { status: 400 }
      );
    }

    const budget = await prisma.trainingBudget.create({
      data: {
        tenantId: user.tenantId,
        fiscalYear: body.fiscalYear,
        departmentId: body.departmentId ?? null,
        departmentName: body.departmentName ?? null,
        allocated: body.allocated != null ? Number(body.allocated) : 0,
        spent: body.spent != null ? Number(body.spent) : 0,
        committed: body.committed != null ? Number(body.committed) : 0,
        currency: body.currency || 'AED',
        notes: body.notes ?? null,
        createdBy: user.userId,
      },
    });

    logger.info({ id: budget.id }, 'Training budget created');
    return NextResponse.json({ success: true, data: budget }, { status: 201 });
  } catch (error: unknown) {
    logger.error({ err: error }, 'Error creating training budget');
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create training budget',
        messageAr: 'فشل في إنشاء ميزانية التدريب',
      },
      { status: 500 }
    );
  }
});
