import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

function serialize(s: any) {
  return {
    id: s.id,
    tenantId: s.tenantId,
    schemeCode: s.schemeCode,
    schemeName: s.schemeName,
    bonusType: s.bonusType,
    description: s.description,
    fiscalYear: s.fiscalYear,
    eligibilityCriteria: s.eligibilityCriteria ?? {},
    payoutCriteria: s.payoutCriteria ?? {},
    budgetAmount: Number(s.budgetAmount),
    currency: s.currency,
    payoutDate: s.payoutDate?.toISOString() || null,
    status: s.status,
    isRecurring: s.isRecurring,
    frequency: s.frequency,
    applicableGrades: s.applicableGrades ?? [],
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.COMPENSATION, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: Record<string, unknown> = { tenantId: user.tenantId, isDeleted: false };
    if (status) where.status = status;

    const schemes = await prisma.bonusScheme.findMany({ where, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: schemes.map(serialize) });
  } catch (error: any) {
    logger.error('Error fetching bonus schemes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch bonus schemes',
        message: 'Failed to fetch bonus schemes',
        messageAr: 'فشل جلب خطط المكافآت',
      },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.COMPENSATION, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    if (!body.schemeName) {
      return NextResponse.json(
        {
          success: false,
          error: 'schemeName is required',
          message: 'schemeName is required',
          messageAr: 'اسم الخطة مطلوب',
        },
        { status: 400 }
      );
    }

    const scheme = await prisma.bonusScheme.create({
      data: {
        tenantId: user.tenantId,
        schemeCode: body.schemeCode || `BON-${Date.now().toString(36).toUpperCase()}`,
        schemeName: body.schemeName,
        bonusType: body.bonusType || 'performance',
        description: body.description || null,
        fiscalYear: body.fiscalYear || String(new Date().getFullYear()),
        eligibilityCriteria: body.eligibilityCriteria ?? undefined,
        payoutCriteria: body.payoutCriteria ?? undefined,
        budgetAmount: Number(body.budgetAmount) || 0,
        currency: body.currency || 'USD',
        payoutDate: body.payoutDate ? new Date(body.payoutDate) : null,
        status: body.status || 'draft',
        isRecurring: body.isRecurring ?? false,
        frequency: body.frequency || null,
        applicableGrades: body.applicableGrades ?? undefined,
        createdBy: user.userId,
      },
    });

    return NextResponse.json({ success: true, data: serialize(scheme) }, { status: 201 });
  } catch (error: any) {
    logger.error('Error creating bonus scheme:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create bonus scheme',
        message: 'Failed to create bonus scheme',
        messageAr: 'فشل إنشاء خطة المكافأة',
      },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.COMPENSATION, Action.UPDATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Scheme ID is required',
          message: 'Scheme ID is required',
          messageAr: 'معرّف الخطة مطلوب',
        },
        { status: 400 }
      );
    }

    const existing = await prisma.bonusScheme.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Scheme not found',
          message: 'Scheme not found',
          messageAr: 'الخطة غير موجودة',
        },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = { updatedBy: user.userId };
    if (body.schemeName) updateData.schemeName = body.schemeName;
    if (body.bonusType) updateData.bonusType = body.bonusType;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.fiscalYear) updateData.fiscalYear = body.fiscalYear;
    if (body.eligibilityCriteria !== undefined)
      updateData.eligibilityCriteria = body.eligibilityCriteria;
    if (body.payoutCriteria !== undefined) updateData.payoutCriteria = body.payoutCriteria;
    if (body.budgetAmount !== undefined) updateData.budgetAmount = Number(body.budgetAmount);
    if (body.currency) updateData.currency = body.currency;
    if (body.payoutDate) updateData.payoutDate = new Date(body.payoutDate);
    if (body.status) updateData.status = body.status;
    if (body.isRecurring !== undefined) updateData.isRecurring = body.isRecurring;
    if (body.frequency !== undefined) updateData.frequency = body.frequency;
    if (body.applicableGrades !== undefined) updateData.applicableGrades = body.applicableGrades;

    // tenant-ok: id-based update preceded by tenant-scoped findFirst above
    const scheme = await prisma.bonusScheme.update({ where: { id }, data: updateData });

    return NextResponse.json({ success: true, data: serialize(scheme) });
  } catch (error: any) {
    logger.error('Error updating bonus scheme:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update bonus scheme',
        message: 'Failed to update bonus scheme',
        messageAr: 'فشل تحديث خطة المكافأة',
      },
      { status: 500 }
    );
  }
});
