import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

function serialize(p: any) {
  return {
    id: p.id,
    tenantId: p.tenantId,
    cycleId: p.cycleId,
    employeeId: p.employeeId,
    currentSalary: Number(p.currentSalary),
    proposedSalary: Number(p.proposedSalary),
    incrementAmount: Number(p.incrementAmount),
    incrementPercentage: p.incrementPercentage,
    incrementType: p.incrementType,
    effectiveDate: p.effectiveDate?.toISOString() || null,
    performanceRating: p.performanceRating,
    justification: p.justification,
    status: p.status,
    submittedBy: p.submittedBy,
    submittedDate: p.submittedDate?.toISOString() || null,
    approvedBy: p.approvedBy,
    approvedDate: p.approvedDate?.toISOString() || null,
    rejectionReason: p.rejectionReason,
    processedDate: p.processedDate?.toISOString() || null,
    notes: p.notes,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.COMPENSATION, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const cycleId = searchParams.get('cycleId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = { tenantId: user.tenantId, isDeleted: false };
    if (cycleId) where.cycleId = cycleId;
    if (status) where.status = status;

    const proposals = await prisma.incrementProposal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: proposals.map(serialize) });
  } catch (error: any) {
    logger.error('Error fetching increment proposals:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch increment proposals',
        message: 'Failed to fetch increment proposals',
        messageAr: 'فشل جلب مقترحات الزيادة',
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

    if (!body.cycleId || !body.employeeId) {
      return NextResponse.json(
        {
          success: false,
          error: 'cycleId and employeeId are required',
          message: 'cycleId and employeeId are required',
          messageAr: 'معرّف الدورة ومعرّف الموظف مطلوبان',
        },
        { status: 400 }
      );
    }

    const currentSalary = Number(body.currentSalary) || 0;
    const proposedSalary = Number(body.proposedSalary) || 0;
    const incrementAmount = proposedSalary - currentSalary;
    const incrementPercentage = currentSalary > 0 ? (incrementAmount / currentSalary) * 100 : 0;

    const proposal = await prisma.incrementProposal.create({
      data: {
        tenantId: user.tenantId,
        cycleId: body.cycleId,
        employeeId: body.employeeId,
        currentSalary,
        proposedSalary,
        incrementAmount,
        incrementPercentage,
        incrementType: body.incrementType || 'merit',
        effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : null,
        performanceRating: body.performanceRating || null,
        justification: body.justification || null,
        status: body.status || 'draft',
        submittedBy: user.userId,
        submittedDate: body.status === 'submitted' ? new Date() : null,
        notes: body.notes || null,
        createdBy: user.userId,
      },
    });

    return NextResponse.json({ success: true, data: serialize(proposal) }, { status: 201 });
  } catch (error: any) {
    logger.error('Error creating increment proposal:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create increment proposal',
        message: 'Failed to create increment proposal',
        messageAr: 'فشل إنشاء مقترح الزيادة',
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
          error: 'Proposal ID is required',
          message: 'Proposal ID is required',
          messageAr: 'معرّف المقترح مطلوب',
        },
        { status: 400 }
      );
    }

    const existing = await prisma.incrementProposal.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Proposal not found',
          message: 'Proposal not found',
          messageAr: 'المقترح غير موجود',
        },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = { updatedBy: user.userId };
    if (body.currentSalary !== undefined || body.proposedSalary !== undefined) {
      const currentSalary = Number(body.currentSalary ?? existing.currentSalary);
      const proposedSalary = Number(body.proposedSalary ?? existing.proposedSalary);
      updateData.currentSalary = currentSalary;
      updateData.proposedSalary = proposedSalary;
      updateData.incrementAmount = proposedSalary - currentSalary;
      updateData.incrementPercentage =
        currentSalary > 0 ? ((proposedSalary - currentSalary) / currentSalary) * 100 : 0;
    }
    if (body.incrementType) updateData.incrementType = body.incrementType;
    if (body.justification !== undefined) updateData.justification = body.justification;
    if (body.performanceRating !== undefined) updateData.performanceRating = body.performanceRating;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.effectiveDate) updateData.effectiveDate = new Date(body.effectiveDate);
    if (body.status) {
      updateData.status = body.status;
      if (body.status === 'submitted') updateData.submittedDate = new Date();
      if (body.status === 'approved') {
        updateData.approvedBy = user.userId;
        updateData.approvedDate = new Date();
      }
      if (body.status === 'rejected') updateData.rejectionReason = body.rejectionReason || null;
      if (body.status === 'processed') updateData.processedDate = new Date();
    }

    // tenant-ok: id-based update preceded by tenant-scoped findFirst above
    const proposal = await prisma.incrementProposal.update({ where: { id }, data: updateData });

    return NextResponse.json({ success: true, data: serialize(proposal) });
  } catch (error: any) {
    logger.error('Error updating increment proposal:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update increment proposal',
        message: 'Failed to update increment proposal',
        messageAr: 'فشل تحديث مقترح الزيادة',
      },
      { status: 500 }
    );
  }
});
