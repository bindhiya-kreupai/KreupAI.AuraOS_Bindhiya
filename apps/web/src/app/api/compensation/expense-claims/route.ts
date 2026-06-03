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
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const employeeId = searchParams.get('employeeId');

    const where: Record<string, unknown> = { tenantId };
    if (status) where.status = status.toUpperCase();
    if (category) where.category = category.toUpperCase();
    if (employeeId) where.employeeId = employeeId;

    const claims = await prisma.expenseClaim.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    const data = claims.map((c) => ({
      id: c.id,
      tenantId: c.tenantId,
      employeeId: c.employeeId,
      title: c.title,
      description: c.description,
      amount: Number(c.amount),
      currency: c.currency,
      category: c.category ?? 'OTHER',
      date: (c.date ?? c.createdAt).toISOString().split('T')[0],
      receiptUrl: c.receiptUrl,
      status: c.status.toLowerCase(),
      approvedBy: c.approvedBy,
      approvedAt: c.approvedAt?.toISOString() || null,
      paidAt: c.paidAt?.toISOString() || null,
      rejectionReason: c.rejectionReason,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    logger.error('Error fetching expense claims:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch expense claims' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.COMPENSATION, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    const tenantId = user.tenantId;
    const body = await request.json();

    const claim = await prisma.expenseClaim.create({
      data: {
        tenantId,
        employeeId: body.employeeId || user.userId,
        title: body.title || body.description || 'Expense Claim',
        description: body.description,
        amount: body.amount,
        currency: body.currency || 'USD',
        category: (body.category || 'OTHER').toUpperCase(),
        date: body.date ? new Date(body.date) : new Date(),
        receiptUrl: body.receiptUrl || null,
        status: 'PENDING',
      },
    });

    return NextResponse.json({ success: true, data: claim }, { status: 201 });
  } catch (error: any) {
    logger.error('Error creating expense claim:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create expense claim' },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.COMPENSATION, Action.UPDATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Expense claim ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.category) updateData.category = updates.category.toUpperCase();
    if (updates.receiptUrl !== undefined) updateData.receiptUrl = updates.receiptUrl;
    if (updates.status) {
      updateData.status = updates.status.toUpperCase();
      if (updates.status.toUpperCase() === 'APPROVED') {
        updateData.approvedBy = user.userId;
        updateData.approvedAt = new Date();
      }
      if (updates.status.toUpperCase() === 'PAID') {
        updateData.paidAt = new Date();
      }
    }
    if (updates.rejectionReason) updateData.rejectionReason = updates.rejectionReason;

    const claim = await prisma.expenseClaim.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: claim });
  } catch (error: any) {
    logger.error('Error updating expense claim:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update expense claim' },
      { status: 500 }
    );
  }
});

export const DELETE = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.COMPENSATION, Action.DELETE, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Expense claim ID is required' },
        { status: 400 }
      );
    }

    await prisma.expenseClaim.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Expense claim deleted' });
  } catch (error: any) {
    logger.error('Error deleting expense claim:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete expense claim' },
      { status: 500 }
    );
  }
});
