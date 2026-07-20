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
    loanCode: s.loanCode,
    schemeId: s.schemeId,
    employeeId: s.employeeId,
    loanType: s.loanType,
    applicationDate: s.applicationDate?.toISOString() || null,
    principalAmount: Number(s.principalAmount),
    interestRate: s.interestRate,
    tenureMonths: s.tenureMonths,
    emiAmount: Number(s.emiAmount),
    totalRepayable: Number(s.totalRepayable),
    disbursementDate: s.disbursementDate?.toISOString() || null,
    currency: s.currency,
    purpose: s.purpose,
    status: s.status,
    outstandingPrincipal: Number(s.outstandingPrincipal),
    outstandingInterest: Number(s.outstandingInterest),
    totalOutstanding: Number(s.totalOutstanding),
    principalPaid: Number(s.principalPaid),
    interestPaid: Number(s.interestPaid),
    totalPaid: Number(s.totalPaid),
    emiSchedule: s.emiSchedule ?? [],
    guarantorId: s.guarantorId,
    collateralDetails: s.collateralDetails,
    submittedBy: s.submittedBy,
    submittedDate: s.submittedDate?.toISOString() || null,
    approvedBy: s.approvedBy,
    approvedDate: s.approvedDate?.toISOString() || null,
    rejectedBy: s.rejectedBy,
    rejectionReason: s.rejectionReason,
    closedDate: s.closedDate?.toISOString() || null,
    notes: s.notes,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

function computeEmi(principal: number, interestRate: number, tenureMonths: number) {
  if (tenureMonths <= 0) return 0;
  if (!interestRate) return principal / tenureMonths;
  const r = interestRate / 100 / 12;
  const pow = Math.pow(1 + r, tenureMonths);
  return (principal * r * pow) / (pow - 1);
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

    const loans = await prisma.employeeLoan.findMany({ where, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, data: loans.map(serialize) });
  } catch (error: any) {
    logger.error('Error fetching employee loans:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch employee loans',
        message: 'Failed to fetch employee loans',
        messageAr: 'فشل جلب قروض الموظفين',
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

    const principalAmount = Number(body.principalAmount) || 0;
    const interestRate = body.interestRate != null ? Number(body.interestRate) : 0;
    const tenureMonths = body.tenureMonths != null ? Number(body.tenureMonths) : 12;

    let emiAmount = 0;
    let totalRepayable = 0;
    let outstandingPrincipal = 0;
    let totalOutstanding = 0;
    if (body.principalAmount != null && body.interestRate != null && body.tenureMonths != null) {
      emiAmount = computeEmi(principalAmount, interestRate, tenureMonths);
      totalRepayable = emiAmount * tenureMonths;
      outstandingPrincipal = principalAmount;
      totalOutstanding = totalRepayable;
    }

    const loan = await prisma.employeeLoan.create({
      data: {
        tenantId: user.tenantId,
        loanCode: body.loanCode || `LON-${Date.now().toString(36).toUpperCase()}`,
        schemeId: body.schemeId || null,
        employeeId: body.employeeId,
        loanType: body.loanType || 'personal',
        applicationDate: body.applicationDate ? new Date(body.applicationDate) : new Date(),
        principalAmount,
        interestRate,
        tenureMonths,
        emiAmount,
        totalRepayable,
        disbursementDate: body.disbursementDate ? new Date(body.disbursementDate) : null,
        currency: body.currency || 'USD',
        purpose: body.purpose || null,
        status: body.status || 'pending',
        outstandingPrincipal,
        totalOutstanding,
        emiSchedule: body.emiSchedule ?? undefined,
        guarantorId: body.guarantorId || null,
        collateralDetails: body.collateralDetails || null,
        notes: body.notes || null,
        createdBy: user.userId,
      },
    });

    return NextResponse.json({ success: true, data: serialize(loan) }, { status: 201 });
  } catch (error: any) {
    logger.error('Error creating employee loan:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create employee loan',
        message: 'Failed to create employee loan',
        messageAr: 'فشل إنشاء قرض الموظف',
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
          error: 'Loan ID is required',
          message: 'Loan ID is required',
          messageAr: 'معرّف القرض مطلوب',
        },
        { status: 400 }
      );
    }

    const existing = await prisma.employeeLoan.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Loan not found',
          message: 'Loan not found',
          messageAr: 'القرض غير موجود',
        },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = { updatedBy: user.userId };
    if (body.loanType) updateData.loanType = body.loanType;
    if (body.purpose !== undefined) updateData.purpose = body.purpose;
    if (body.currency) updateData.currency = body.currency;
    if (body.guarantorId !== undefined) updateData.guarantorId = body.guarantorId;
    if (body.collateralDetails !== undefined) updateData.collateralDetails = body.collateralDetails;
    if (body.emiSchedule !== undefined) updateData.emiSchedule = body.emiSchedule;
    if (body.notes !== undefined) updateData.notes = body.notes;

    if (body.status) {
      updateData.status = body.status;
      if (body.status === 'approved') {
        updateData.approvedBy = user.userId;
        updateData.approvedDate = new Date();
        updateData.disbursementDate = new Date();
      } else if (body.status === 'rejected') {
        updateData.rejectedBy = user.userId;
        updateData.rejectionReason = body.rejectionReason || null;
      }
    }

    // tenant-ok: id-based update preceded by tenant-scoped findFirst above
    const loan = await prisma.employeeLoan.update({ where: { id }, data: updateData });

    return NextResponse.json({ success: true, data: serialize(loan) });
  } catch (error: any) {
    logger.error('Error updating employee loan:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update employee loan',
        message: 'Failed to update employee loan',
        messageAr: 'فشل تحديث قرض الموظف',
      },
      { status: 500 }
    );
  }
});
