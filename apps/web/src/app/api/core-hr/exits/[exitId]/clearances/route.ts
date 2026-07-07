import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { z } from 'zod';

const updateClearanceSchema = z.object({
  clearanceId: z.string().min(1),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CLEARED', 'REJECTED']),
  notes: z.string().optional(),
});

// PATCH updates a single clearance item within an exit request and recomputes
// the overall clearanceStatus on the parent exit.
export const PATCH = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params } = context;
    const exitId = params?.exitId;
    const body = await request.json();
    const validated = updateClearanceSchema.parse(body);

    // Verify the exit belongs to the tenant.
    const exit = await prisma.exitRequest.findFirst({
      where: { id: exitId, tenantId: user.tenantId },
      include: { clearances: true },
    });

    if (!exit) {
      return NextResponse.json(
        { error: 'Exit request not found', messageAr: 'طلب الخروج غير موجود' },
        { status: 404 }
      );
    }

    const clearance = exit.clearances.find((c) => c.id === validated.clearanceId);
    if (!clearance) {
      return NextResponse.json(
        { error: 'Clearance item not found', messageAr: 'عنصر التخليص غير موجود' },
        { status: 404 }
      );
    }

    const isDone = validated.status === 'COMPLETED' || validated.status === 'CLEARED';

    await prisma.exitClearance.update({
      where: { id: validated.clearanceId },
      data: {
        status: validated.status,
        notes: validated.notes ?? clearance.notes,
        clearedBy: isDone ? user.userId : null,
        clearedAt: isDone ? new Date() : null,
        updatedBy: user.userId,
      },
    });

    // Recompute overall clearance status.
    const refreshed = await prisma.exitClearance.findMany({
      where: { exitRequestId: exitId },
    });
    const allDone =
      refreshed.length > 0 &&
      refreshed.every((c) => c.status === 'COMPLETED' || c.status === 'CLEARED');
    const anyDone = refreshed.some((c) => c.status === 'COMPLETED' || c.status === 'CLEARED');
    const overall = allDone ? 'COMPLETED' : anyDone ? 'IN_PROGRESS' : 'PENDING';

    const updatedExit = await prisma.exitRequest.update({
      where: { id: exitId },
      data: { clearanceStatus: overall, updatedBy: user.userId },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            department: true,
          },
        },
        clearances: true,
      },
    });

    return NextResponse.json({ exit: updatedExit }, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', messageAr: 'فشل التحقق', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating clearance item:', error);
    return NextResponse.json(
      { error: 'Internal server error', messageAr: 'خطأ في الخادم الداخلي' },
      { status: 500 }
    );
  }
});
