import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

const CompOffSchema = z.object({
  employeeId: z.string().min(1),
  workedDate: z.string(),
  workedHours: z.coerce.number().positive(),
  reason: z.string().min(1),
  projectCode: z.string().optional(),
  creditedDays: z.coerce.number().default(1),
  expiryDate: z.string(),
});

// GET - Fetch comp-off tracking data from database
export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.LEAVE, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId') || user.userId;
    const status = searchParams.get('status');

    const tenantId = user.tenantId;

    const where: Record<string, unknown> = { tenantId };
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;

    const compOffs = await prisma.compOffEarned.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const summary = {
      total: compOffs.length,
      available: compOffs.filter((co) => !co.isUsed && co.status === 'APPROVED').length,
      used: compOffs.filter((co) => co.isUsed).length,
      pending: compOffs.filter((co) => co.status === 'PENDING').length,
    };

    return NextResponse.json({
      success: true,
      compOffs,
      compOffRequests: compOffs,
      data: { compOffs, summary },
    });
  } catch (error: any) {
    logger.error('Error fetching comp-off data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch comp-off data' },
      { status: 500 }
    );
  }
});

// POST - Request comp-off in database
export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.LEAVE, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    const data = CompOffSchema.parse(body);
    const tenantId = user.tenantId;

    const newCompOff = await prisma.compOffEarned.create({
      data: {
        tenantId,
        employeeId: data.employeeId,
        workedDate: new Date(data.workedDate),
        workedHours: data.workedHours,
        reason: data.reason,
        projectCode: data.projectCode || null,
        creditedDays: data.creditedDays,
        expiryDate: new Date(data.expiryDate),
        remainingDays: data.creditedDays,
        status: 'PENDING',
      },
    });

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.userId,
        action: 'CREATE',
        module: 'LEAVE',
        resourceType: 'Leave - Comp-off',
        metadata: {
          description: `Requested comp-off for ${data.workedDate} - ${data.workedHours} hours`,
        } as any,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json(
      { success: true, data: newCompOff, compOff: newCompOff, compOffRequest: newCompOff },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    logger.error('Error creating comp-off:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create comp-off' },
      { status: 500 }
    );
  }
});

// PUT - Approve/Reject comp-off in database
export const PUT = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.LEAVE, Action.UPDATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    const { id, status, rejectionReason } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: id, status' },
        { status: 400 }
      );
    }

    const tenantId = user.tenantId;

    // Verify the comp-off exists and belongs to this tenant
    const existing = await prisma.compOffEarned.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Comp-off request not found' },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = { status };

    if (status === 'APPROVED') {
      updateData.approvedBy = user.userId;
      updateData.approvedAt = new Date();
    } else if (status === 'REJECTED') {
      updateData.rejectedBy = user.userId;
      updateData.rejectionReason = rejectionReason || null;
    }

    const updated = await prisma.compOffEarned.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.userId,
        action: 'UPDATE',
        module: 'LEAVE',
        resourceType: 'Leave - Comp-off',
        metadata: { description: `${status} comp-off request: ${id}` } as any,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      compOff: updated,
      compOffRequest: updated,
    });
  } catch (error: any) {
    logger.error('Error updating comp-off:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update comp-off' },
      { status: 500 }
    );
  }
});
