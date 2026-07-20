import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

// Update a single ExitClearance item (e.g. mark a clearance task done).
// The clearance is tenant-scoped through its parent ExitRequest, and the
// parent's aggregate clearanceStatus is recomputed after each change.
export const PATCH = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const url = new URL(request.url);
    const segments = url.pathname.split('/').filter(Boolean);
    const clearanceId = segments[segments.length - 1];
    const body = await request.json();

    if (!clearanceId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Clearance ID is required',
          messageAr: 'معرّف الإخلاء مطلوب',
        },
        { status: 400 }
      );
    }

    // Verify the clearance belongs to a tenant-owned exit request.
    const existing = await prisma.exitClearance.findFirst({
      where: {
        id: clearanceId,
        exitRequest: { tenantId: user.tenantId },
      },
      include: { exitRequest: true },
    });

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'Clearance item not found',
          messageAr: 'لم يتم العثور على عنصر الإخلاء',
        },
        { status: 404 }
      );
    }

    const dataToUpdate: Record<string, unknown> = {};

    if (body.status !== undefined) {
      const normalized = String(body.status).toUpperCase();
      const allowed = ['PENDING', 'APPROVED', 'REJECTED'];
      if (!allowed.includes(normalized)) {
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid clearance status',
            messageAr: 'حالة الإخلاء غير صالحة',
          },
          { status: 400 }
        );
      }
      dataToUpdate.status = normalized;
      if (normalized === 'APPROVED') {
        dataToUpdate.clearedBy = user.employeeId;
        dataToUpdate.clearedAt = new Date();
      } else {
        dataToUpdate.clearedBy = null;
        dataToUpdate.clearedAt = null;
      }
    }

    if (body.notes !== undefined) {
      dataToUpdate.notes = body.notes;
    }

    dataToUpdate.updatedBy = user.employeeId;

    const updated = await prisma.exitClearance.update({
      where: { id: clearanceId },
      data: dataToUpdate,
    });

    // Recompute the parent exit request's aggregate clearance status.
    const siblings = await prisma.exitClearance.findMany({
      where: { exitRequestId: existing.exitRequestId, isDeleted: false },
      select: { status: true },
    });
    const total = siblings.length;
    const approved = siblings.filter((c) => c.status === 'APPROVED').length;
    let clearanceStatus = 'PENDING';
    if (total > 0 && approved === total) {
      clearanceStatus = 'COMPLETED';
    } else if (approved > 0) {
      clearanceStatus = 'IN_PROGRESS';
    }

    await prisma.exitRequest.update({
      where: { id: existing.exitRequestId },
      data: { clearanceStatus },
    });

    return NextResponse.json(
      {
        success: true,
        clearance: {
          id: updated.id,
          exitRequestId: updated.exitRequestId,
          department: updated.department,
          description: updated.description,
          status: updated.status.toLowerCase(),
          clearedBy: updated.clearedBy,
          clearedAt: updated.clearedAt?.toISOString() || null,
          notes: updated.notes,
        },
        clearanceStatus,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error updating clearance item:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to update clearance item',
        messageAr: 'فشل تحديث عنصر الإخلاء',
      },
      { status: 500 }
    );
  }
});
