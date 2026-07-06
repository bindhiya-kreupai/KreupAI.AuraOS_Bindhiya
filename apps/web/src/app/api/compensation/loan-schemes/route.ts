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
    loanType: s.loanType,
    description: s.description,
    maxAmount: Number(s.maxAmount),
    minAmount: Number(s.minAmount),
    maxTenureMonths: s.maxTenureMonths,
    minTenureMonths: s.minTenureMonths,
    interestRate: s.interestRate,
    isInterestBearing: s.isInterestBearing,
    eligibilityCriteria: s.eligibilityCriteria ?? {},
    currency: s.currency,
    isActive: s.isActive,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.COMPENSATION, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    const where: Record<string, unknown> = { tenantId: user.tenantId, isDeleted: false };
    if (isActive !== null) where.isActive = isActive === 'true';

    const schemes = await prisma.loanScheme.findMany({ where, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: schemes.map(serialize) });
  } catch (error: any) {
    logger.error('Error fetching loan schemes:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch loan schemes',
        message: 'Failed to fetch loan schemes',
        messageAr: 'فشل جلب خطط القروض',
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

    const scheme = await prisma.loanScheme.create({
      data: {
        tenantId: user.tenantId,
        schemeCode: body.schemeCode || `LSC-${Date.now().toString(36).toUpperCase()}`,
        schemeName: body.schemeName,
        loanType: body.loanType || 'personal',
        description: body.description || null,
        maxAmount: Number(body.maxAmount) || 0,
        minAmount: Number(body.minAmount) || 0,
        maxTenureMonths: body.maxTenureMonths != null ? Number(body.maxTenureMonths) : 12,
        minTenureMonths: body.minTenureMonths != null ? Number(body.minTenureMonths) : 1,
        interestRate: body.interestRate != null ? Number(body.interestRate) : 0,
        isInterestBearing: body.isInterestBearing ?? false,
        eligibilityCriteria: body.eligibilityCriteria ?? undefined,
        currency: body.currency || 'USD',
        isActive: body.isActive ?? true,
        createdBy: user.userId,
      },
    });

    return NextResponse.json({ success: true, data: serialize(scheme) }, { status: 201 });
  } catch (error: any) {
    logger.error('Error creating loan scheme:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create loan scheme',
        message: 'Failed to create loan scheme',
        messageAr: 'فشل إنشاء خطة القرض',
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

    const existing = await prisma.loanScheme.findFirst({
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
    if (body.loanType) updateData.loanType = body.loanType;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.maxAmount !== undefined) updateData.maxAmount = Number(body.maxAmount);
    if (body.minAmount !== undefined) updateData.minAmount = Number(body.minAmount);
    if (body.maxTenureMonths !== undefined)
      updateData.maxTenureMonths = Number(body.maxTenureMonths);
    if (body.minTenureMonths !== undefined)
      updateData.minTenureMonths = Number(body.minTenureMonths);
    if (body.interestRate !== undefined) updateData.interestRate = Number(body.interestRate);
    if (body.isInterestBearing !== undefined) updateData.isInterestBearing = body.isInterestBearing;
    if (body.eligibilityCriteria !== undefined)
      updateData.eligibilityCriteria = body.eligibilityCriteria;
    if (body.currency) updateData.currency = body.currency;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    // tenant-ok: id-based update preceded by tenant-scoped findFirst above
    const scheme = await prisma.loanScheme.update({ where: { id }, data: updateData });

    return NextResponse.json({ success: true, data: serialize(scheme) });
  } catch (error: any) {
    logger.error('Error updating loan scheme:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update loan scheme',
        message: 'Failed to update loan scheme',
        messageAr: 'فشل تحديث خطة القرض',
      },
      { status: 500 }
    );
  }
});
