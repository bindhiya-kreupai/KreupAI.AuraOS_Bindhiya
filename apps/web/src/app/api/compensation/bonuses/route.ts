import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.COMPENSATION, Action.READ, permissions);
    if (permissionError) return permissionError;

    const tenantId = user.tenantId;
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {
      tenantId,
      category: 'BONUS',
    };
    if (employeeId) where.employeeId = employeeId;
    if (status) where.approvalStatus = status.toUpperCase();

    const bonuses = await prisma.payrollAdjustment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Transform to match frontend-expected shape
    const data = bonuses.map((b) => ({
      id: b.id,
      employeeId: b.employeeId,
      tenantId: b.tenantId,
      payrollMonth: b.payrollMonth,
      adjustmentType: b.adjustmentType,
      code: b.code,
      name: b.name,
      amount: Number(b.amount),
      reason: b.reason,
      category: b.category,
      isProcessed: b.isProcessed,
      processedInRun: b.processedInRun,
      processedAt: b.processedAt?.toISOString() || null,
      approvalStatus: b.approvalStatus,
      approvedBy: b.approvedBy,
      approvedAt: b.approvedAt?.toISOString() || null,
      createdBy: b.createdBy,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    logger.error('Error fetching bonuses:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch bonuses' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.COMPENSATION, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    const tenantId = user.tenantId;
    const body = await request.json();

    const bonus = await prisma.payrollAdjustment.create({
      data: {
        tenantId,
        employeeId: body.employeeId,
        payrollMonth: body.payrollMonth || new Date().toISOString().slice(0, 7),
        adjustmentType: 'EARNING',
        code: body.code || 'BONUS',
        name: body.name || 'Performance Bonus',
        amount: body.amount,
        reason: body.reason || 'Bonus payout',
        category: 'BONUS',
        requiresApproval: body.requiresApproval ?? true,
        approvalStatus: body.approvalStatus || 'PENDING',
        createdBy: user.userId,
      },
    });

    return NextResponse.json({ success: true, data: bonus }, { status: 201 });
  } catch (error: any) {
    logger.error('Error creating bonus:', error);
    return NextResponse.json({ success: false, error: 'Failed to create bonus' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.COMPENSATION, Action.UPDATE, permissions);
    if (permissionError) return permissionError;

    const tenantId = user.tenantId;
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Bonus ID is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.reason) updateData.reason = updates.reason;
    if (updates.approvalStatus) updateData.approvalStatus = updates.approvalStatus;
    if (updates.approvedBy) {
      updateData.approvedBy = updates.approvedBy;
      updateData.approvedAt = new Date();
    }
    if (updates.isProcessed !== undefined) {
      updateData.isProcessed = updates.isProcessed;
      if (updates.isProcessed) updateData.processedAt = new Date();
    }

    // Tenant-scope the lookup before touching the row by id
    const existing = await prisma.payrollAdjustment.findFirst({
      where: { id, tenantId: user.tenantId },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Bonus not found' }, { status: 404 });
    }

    // tenant-ok: id-based update preceded by tenant-scoped findFirst above
    const bonus = await prisma.payrollAdjustment.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: bonus });
  } catch (error: any) {
    logger.error('Error updating bonus:', error);
    return NextResponse.json({ success: false, error: 'Failed to update bonus' }, { status: 500 });
  }
});
