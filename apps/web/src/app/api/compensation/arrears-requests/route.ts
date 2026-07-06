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
    requestCode: s.requestCode,
    employeeId: s.employeeId,
    arrearsType: s.arrearsType,
    reason: s.reason,
    effectiveFrom: s.effectiveFrom?.toISOString() || null,
    effectiveTo: s.effectiveTo?.toISOString() || null,
    oldSalary: Number(s.oldSalary),
    newSalary: Number(s.newSalary),
    difference: Number(s.difference),
    numberOfMonths: s.numberOfMonths,
    totalArrears: Number(s.totalArrears),
    currency: s.currency,
    paymentMode: s.paymentMode,
    numberOfInstallments: s.numberOfInstallments,
    status: s.status,
    submittedBy: s.submittedBy,
    submittedDate: s.submittedDate?.toISOString() || null,
    approvedBy: s.approvedBy,
    approvedDate: s.approvedDate?.toISOString() || null,
    rejectedBy: s.rejectedBy,
    rejectionReason: s.rejectionReason,
    processedDate: s.processedDate?.toISOString() || null,
    paymentSchedule: s.paymentSchedule ?? {},
    notes: s.notes,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

function monthDiff(from: Date, to: Date) {
  const months =
    (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()) + 1;
  return Math.max(1, months);
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

    const requests = await prisma.arrearsRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: requests.map(serialize) });
  } catch (error: any) {
    logger.error('Error fetching arrears requests:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch arrears requests',
        message: 'Failed to fetch arrears requests',
        messageAr: 'فشل جلب طلبات المتأخرات',
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
    if (!body.employeeId || !body.effectiveFrom || !body.effectiveTo) {
      return NextResponse.json(
        {
          success: false,
          error: 'employeeId, effectiveFrom and effectiveTo are required',
          message: 'employeeId, effectiveFrom and effectiveTo are required',
          messageAr: 'معرّف الموظف وتاريخ السريان من وإلى مطلوبة',
        },
        { status: 400 }
      );
    }

    const oldSalary = Number(body.oldSalary) || 0;
    const newSalary = Number(body.newSalary) || 0;
    const effectiveFrom = new Date(body.effectiveFrom);
    const effectiveTo = new Date(body.effectiveTo);
    const difference = newSalary - oldSalary;
    const numberOfMonths = monthDiff(effectiveFrom, effectiveTo);
    const totalArrears = difference * numberOfMonths;

    const arrears = await prisma.arrearsRequest.create({
      data: {
        tenantId: user.tenantId,
        requestCode: body.requestCode || `ARR-${Date.now().toString(36).toUpperCase()}`,
        employeeId: body.employeeId,
        arrearsType: body.arrearsType || 'salary_revision',
        reason: body.reason || null,
        effectiveFrom,
        effectiveTo,
        oldSalary,
        newSalary,
        difference,
        numberOfMonths,
        totalArrears,
        currency: body.currency || 'USD',
        paymentMode: body.paymentMode || 'lumpsum',
        numberOfInstallments:
          body.numberOfInstallments != null ? Number(body.numberOfInstallments) : null,
        status: body.status || 'draft',
        paymentSchedule: body.paymentSchedule ?? undefined,
        notes: body.notes || null,
        createdBy: user.userId,
      },
    });

    return NextResponse.json({ success: true, data: serialize(arrears) }, { status: 201 });
  } catch (error: any) {
    logger.error('Error creating arrears request:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create arrears request',
        message: 'Failed to create arrears request',
        messageAr: 'فشل إنشاء طلب المتأخرات',
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
          error: 'Request ID is required',
          message: 'Request ID is required',
          messageAr: 'معرّف الطلب مطلوب',
        },
        { status: 400 }
      );
    }

    const existing = await prisma.arrearsRequest.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request not found',
          message: 'Request not found',
          messageAr: 'الطلب غير موجود',
        },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = { updatedBy: user.userId };

    if (body.action === 'calculate') {
      const oldSalary =
        body.oldSalary !== undefined ? Number(body.oldSalary) : Number(existing.oldSalary);
      const newSalary =
        body.newSalary !== undefined ? Number(body.newSalary) : Number(existing.newSalary);
      const effectiveFrom = body.effectiveFrom
        ? new Date(body.effectiveFrom)
        : existing.effectiveFrom;
      const effectiveTo = body.effectiveTo ? new Date(body.effectiveTo) : existing.effectiveTo;
      const difference = newSalary - oldSalary;
      const numberOfMonths = monthDiff(effectiveFrom, effectiveTo);
      updateData.oldSalary = oldSalary;
      updateData.newSalary = newSalary;
      updateData.effectiveFrom = effectiveFrom;
      updateData.effectiveTo = effectiveTo;
      updateData.difference = difference;
      updateData.numberOfMonths = numberOfMonths;
      updateData.totalArrears = difference * numberOfMonths;
      updateData.status = 'submitted';
      updateData.submittedBy = user.userId;
      updateData.submittedDate = new Date();
    } else {
      if (body.arrearsType) updateData.arrearsType = body.arrearsType;
      if (body.reason !== undefined) updateData.reason = body.reason;
      if (body.currency) updateData.currency = body.currency;
      if (body.paymentMode) updateData.paymentMode = body.paymentMode;
      if (body.numberOfInstallments !== undefined)
        updateData.numberOfInstallments =
          body.numberOfInstallments != null ? Number(body.numberOfInstallments) : null;
      if (body.paymentSchedule !== undefined) updateData.paymentSchedule = body.paymentSchedule;
      if (body.notes !== undefined) updateData.notes = body.notes;

      if (body.status) {
        updateData.status = body.status;
        if (body.status === 'submitted') {
          updateData.submittedBy = user.userId;
          updateData.submittedDate = new Date();
        } else if (body.status === 'approved') {
          updateData.approvedBy = user.userId;
          updateData.approvedDate = new Date();
        } else if (body.status === 'rejected') {
          updateData.rejectedBy = user.userId;
          updateData.rejectionReason = body.rejectionReason || null;
        } else if (body.status === 'processed') {
          updateData.processedDate = new Date();
        }
      }
    }

    // tenant-ok: id-based update preceded by tenant-scoped findFirst above
    const arrears = await prisma.arrearsRequest.update({ where: { id }, data: updateData });

    return NextResponse.json({ success: true, data: serialize(arrears) });
  } catch (error: any) {
    logger.error('Error updating arrears request:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update arrears request',
        message: 'Failed to update arrears request',
        messageAr: 'فشل تحديث طلب المتأخرات',
      },
      { status: 500 }
    );
  }
});
