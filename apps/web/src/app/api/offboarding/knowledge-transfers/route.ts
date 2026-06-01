import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

// Knowledge transfers are derived from ExitRequest + ExitClearance records.
// Clearance items for departments can represent knowledge transfer tasks.

// ===== GET Handler =====
export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const where: Record<string, unknown> = {
      tenantId: user.tenantId,
    };

    const offboardingId = searchParams.get('offboardingId');
    if (offboardingId) where.id = offboardingId;

    const employeeId = searchParams.get('employeeId');
    if (employeeId) where.employeeId = employeeId;

    const exitRequests = await prisma.exitRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        clearances: true,
      },
    });

    const transfers = exitRequests.map((req) => {
      const totalItems = req.clearances.length;
      const completedItems = req.clearances.filter(
        (c) => c.status === 'APPROVED'
      ).length;
      const progress =
        totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

      // Derive knowledge transfer status
      let ktStatus: string = 'not_started';
      if (completedItems === totalItems && totalItems > 0) ktStatus = 'completed';
      else if (completedItems > 0) ktStatus = 'in_progress';

      return {
        id: `KT-${req.id}`,
        offboardingId: req.id,
        employeeId: req.employeeId,
        employeeName: req.employee
          ? `${req.employee.firstName} ${req.employee.lastName}`
          : '',
        successorId: null,
        successorName: null,
        managerId: '',
        managerName: '',
        startDate: req.createdAt.toISOString(),
        targetCompletionDate: req.lastWorkingDate.toISOString(),
        actualCompletionDate:
          ktStatus === 'completed' ? req.updatedAt.toISOString() : null,
        status: ktStatus,
        progress,
        sessions: [],
        documentation: [],
        handoverChecklist: req.clearances.map((c) => ({
          id: c.id,
          category: 'responsibilities' as const,
          itemName: c.description,
          description: `${c.department} - ${c.description}`,
          status: c.status === 'APPROVED' ? 'completed' : 'pending',
          completedDate: c.clearedAt?.toISOString() || null,
        })),
        completedItems,
        totalItems,
        notes: req.reason,
        createdDate: req.createdAt.toISOString(),
        lastModified: req.updatedAt.toISOString(),
      };
    });

    return NextResponse.json(
      { success: true, transfers },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching knowledge transfers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch knowledge transfers' },
      { status: 500 }
    );
  }
});

// ===== POST Handler =====
export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const body = await request.json();

    const transfer = {
      id: body.id || `KT-${body.offboardingId || Date.now()}`,
      offboardingId: body.offboardingId,
      employeeId: body.employeeId,
      employeeName: body.employeeName || '',
      successorId: body.successorId || null,
      successorName: body.successorName || null,
      managerId: body.managerId || '',
      managerName: body.managerName || '',
      startDate: body.startDate || new Date().toISOString(),
      targetCompletionDate: body.targetCompletionDate,
      status: 'not_started',
      progress: 0,
      sessions: body.sessions || [],
      documentation: body.documentation || [],
      handoverChecklist: body.handoverChecklist || [],
      completedItems: 0,
      totalItems: body.handoverChecklist?.length || 0,
      createdDate: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, transfer },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating knowledge transfer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create knowledge transfer' },
      { status: 500 }
    );
  }
});

// ===== PUT Handler =====
export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Knowledge transfer ID is required' },
        { status: 400 }
      );
    }

    // If updating clearance items (handover checklist), update the ExitClearance records
    const exitRequestId = id.startsWith('KT-') ? id.replace('KT-', '') : id;

    if (updates.handoverChecklist && Array.isArray(updates.handoverChecklist)) {
      for (const item of updates.handoverChecklist) {
        if (item.id && item.status === 'completed') {
          try {
            await prisma.exitClearance.update({
              where: { id: item.id },
              data: {
                status: 'APPROVED',
                clearedAt: new Date(),
                notes: item.notes || null,
              },
            });
          } catch {
            // Clearance item may not exist if it was created client-side
          }
        }
      }
    }

    const transfer = {
      id,
      offboardingId: exitRequestId,
      ...updates,
      lastModified: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, transfer },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating knowledge transfer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update knowledge transfer' },
      { status: 500 }
    );
  }
});
