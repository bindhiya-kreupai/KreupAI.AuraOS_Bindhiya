import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

function serialize(g: any) {
  return {
    id: g.id,
    tenantId: g.tenantId,
    grantCode: g.grantCode,
    employeeId: g.employeeId,
    stockType: g.stockType,
    grantDate: g.grantDate.toISOString(),
    numberOfUnits: g.numberOfUnits,
    grantPrice: Number(g.grantPrice),
    fairMarketValue: Number(g.fairMarketValue),
    totalValue: Number(g.totalValue),
    currency: g.currency,
    vestingSchedule: g.vestingSchedule,
    vestingStartDate: g.vestingStartDate?.toISOString() || null,
    vestingEndDate: g.vestingEndDate?.toISOString() || null,
    vestingPeriodYears: g.vestingPeriodYears,
    cliffPeriodMonths: g.cliffPeriodMonths,
    vestingScheduleDetails: g.vestingScheduleDetails ?? [],
    exercisePrice: g.exercisePrice != null ? Number(g.exercisePrice) : null,
    expirationDate: g.expirationDate?.toISOString() || null,
    status: g.status,
    vestedUnits: g.vestedUnits,
    unvestedUnits: g.unvestedUnits,
    exercisedUnits: g.exercisedUnits,
    forfeitedUnits: g.forfeitedUnits,
    reason: g.reason,
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
  };
}

export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.COMPENSATION, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = { tenantId: user.tenantId, isDeleted: false };
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    const grants = await prisma.stockGrant.findMany({ where, orderBy: { grantDate: 'desc' } });
    return NextResponse.json({ success: true, data: grants.map(serialize) });
  } catch (error: any) {
    logger.error('Error fetching stock grants:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch stock grants',
        message: 'Failed to fetch stock grants',
        messageAr: 'فشل جلب منح الأسهم',
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
    if (!body.employeeId) {
      return NextResponse.json(
        {
          success: false,
          error: 'employeeId is required',
          message: 'employeeId is required',
          messageAr: 'معرّف الموظف مطلوب',
        },
        { status: 400 }
      );
    }

    const numberOfUnits = Number(body.numberOfUnits) || 0;
    const fairMarketValue = Number(body.fairMarketValue) || 0;
    const totalValue =
      body.totalValue != null ? Number(body.totalValue) : numberOfUnits * fairMarketValue;

    const grant = await prisma.stockGrant.create({
      data: {
        tenantId: user.tenantId,
        grantCode: body.grantCode || `GRT-${Date.now().toString(36).toUpperCase()}`,
        employeeId: body.employeeId,
        stockType: body.stockType || 'RSU',
        grantDate: body.grantDate ? new Date(body.grantDate) : new Date(),
        numberOfUnits,
        grantPrice: Number(body.grantPrice) || 0,
        fairMarketValue,
        totalValue,
        currency: body.currency || 'USD',
        vestingSchedule: body.vestingSchedule || 'graded',
        vestingStartDate: body.vestingStartDate ? new Date(body.vestingStartDate) : null,
        vestingEndDate: body.vestingEndDate ? new Date(body.vestingEndDate) : null,
        vestingPeriodYears: Number(body.vestingPeriodYears) || 4,
        cliffPeriodMonths: body.cliffPeriodMonths ?? null,
        vestingScheduleDetails: body.vestingScheduleDetails ?? undefined,
        exercisePrice: body.exercisePrice != null ? Number(body.exercisePrice) : null,
        expirationDate: body.expirationDate ? new Date(body.expirationDate) : null,
        status: body.status || 'granted',
        vestedUnits: Number(body.vestedUnits) || 0,
        unvestedUnits: body.unvestedUnits != null ? Number(body.unvestedUnits) : numberOfUnits,
        reason: body.reason || null,
        grantedBy: user.userId,
        createdBy: user.userId,
      },
    });

    return NextResponse.json({ success: true, data: serialize(grant) }, { status: 201 });
  } catch (error: any) {
    logger.error('Error creating stock grant:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create stock grant',
        message: 'Failed to create stock grant',
        messageAr: 'فشل إنشاء منحة الأسهم',
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
          error: 'Grant ID is required',
          message: 'Grant ID is required',
          messageAr: 'معرّف المنحة مطلوب',
        },
        { status: 400 }
      );
    }

    const existing = await prisma.stockGrant.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Grant not found',
          message: 'Grant not found',
          messageAr: 'المنحة غير موجودة',
        },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = { updatedBy: user.userId };
    if (body.status) updateData.status = body.status;
    if (body.vestedUnits !== undefined) updateData.vestedUnits = Number(body.vestedUnits);
    if (body.unvestedUnits !== undefined) updateData.unvestedUnits = Number(body.unvestedUnits);
    if (body.exercisedUnits !== undefined) updateData.exercisedUnits = Number(body.exercisedUnits);
    if (body.forfeitedUnits !== undefined) updateData.forfeitedUnits = Number(body.forfeitedUnits);
    if (body.fairMarketValue !== undefined)
      updateData.fairMarketValue = Number(body.fairMarketValue);
    if (body.reason !== undefined) updateData.reason = body.reason;

    // tenant-ok: id-based update preceded by tenant-scoped findFirst above
    const grant = await prisma.stockGrant.update({ where: { id }, data: updateData });

    return NextResponse.json({ success: true, data: serialize(grant) });
  } catch (error: any) {
    logger.error('Error updating stock grant:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update stock grant',
        message: 'Failed to update stock grant',
        messageAr: 'فشل تحديث منحة الأسهم',
      },
      { status: 500 }
    );
  }
});
