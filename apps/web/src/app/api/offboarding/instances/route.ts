import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

// ===== GET Handler =====
export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const where: Record<string, unknown> = {
      tenantId: user.tenantId,
    };

    const employeeId = searchParams.get('employeeId');
    if (employeeId) where.employeeId = employeeId;

    const status = searchParams.get('status');
    if (status) where.status = status.toUpperCase();

    const exitType = searchParams.get('exitType');
    if (exitType) where.exitType = exitType.toUpperCase();

    const departmentId = searchParams.get('departmentId');
    if (departmentId) {
      where.employee = { departmentId };
    }

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
            departmentId: true,
            positionId: true,
          },
        },
        clearances: true,
      },
    });

    // Map ExitRequest + ExitClearance into an OffboardingInstance shape
    const instances = exitRequests.map((req) => {
      const totalClearances = req.clearances.length;
      const completedClearances = req.clearances.filter(
        (c) => c.status === 'APPROVED'
      ).length;
      const progress =
        totalClearances > 0
          ? Math.round((completedClearances / totalClearances) * 100)
          : 0;

      // Determine phase based on status
      let currentPhase = 'notice_period';
      if (req.clearanceStatus === 'IN_PROGRESS') currentPhase = 'exit_formalities';
      if (req.clearanceStatus === 'COMPLETED') currentPhase = 'final_settlement';
      if (req.status === 'COMPLETED') currentPhase = 'post_exit';

      return {
        id: req.id,
        offboardingCode: `OFF-${req.id.slice(0, 8).toUpperCase()}`,
        employeeId: req.employeeId,
        employeeName: req.employee
          ? `${req.employee.firstName} ${req.employee.lastName}`
          : '',
        employeeEmail: req.employee?.email || '',
        departmentId: req.employee?.departmentId || '',
        departmentName: '',
        positionId: req.employee?.positionId || '',
        positionTitle: '',
        managerId: '',
        managerName: '',
        hrContactId: '',
        hrContactName: '',
        offboardingType: req.exitType.toLowerCase(),
        initiatedDate: req.createdAt.toISOString(),
        lastWorkingDate: req.lastWorkingDate.toISOString(),
        noticePeriodDays: req.noticePeriodDays,
        status: req.status.toLowerCase(),
        currentPhase,
        progress,
        tasks: [],
        completedTasks: completedClearances,
        totalTasks: totalClearances,
        overdueTasks: 0,
        equipmentReturns: [],
        accessRevocations: [],
        clearances: req.clearances.map((c) => ({
          id: c.id,
          exitRequestId: c.exitRequestId,
          department: c.department,
          description: c.description,
          status: c.status.toLowerCase(),
          clearedBy: c.clearedBy,
          clearedAt: c.clearedAt?.toISOString() || null,
          notes: c.notes,
        })),
        rehireEligibility: req.rehireEligible ? 'eligible' : 'not_eligible',
        notes: req.reason,
        settlementAmount: req.settlementAmount
          ? Number(req.settlementAmount)
          : null,
        createdDate: req.createdAt.toISOString(),
        lastModified: req.updatedAt.toISOString(),
      };
    });

    return NextResponse.json(
      { success: true, instances },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching offboarding instances:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch offboarding instances' },
      { status: 500 }
    );
  }
});

// ===== POST Handler =====
export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Create ExitRequest as the core offboarding instance
    const exitRequest = await prisma.exitRequest.create({
      data: {
        tenantId: user.tenantId,
        employeeId: body.employeeId,
        exitType: (body.offboardingType || body.exitType || 'RESIGNATION').toUpperCase(),
        resignationDate: new Date(body.initiatedDate || new Date()),
        lastWorkingDate: new Date(body.lastWorkingDate),
        noticePeriodDays: body.noticePeriodDays || 30,
        reason: body.notes || body.reason || null,
        status: 'PENDING',
        clearanceStatus: 'PENDING',
        rehireEligible: body.rehireEligibility !== 'not_eligible',
      },
    });

    // Create default clearance items if provided
    if (body.clearances && Array.isArray(body.clearances)) {
      for (const clearance of body.clearances) {
        await prisma.exitClearance.create({
          data: {
            exitRequestId: exitRequest.id,
            department: clearance.department || clearance.departmentName,
            description: clearance.description || `${clearance.department} clearance`,
            status: 'PENDING',
          },
        });
      }
    }

    // Fetch the complete instance with clearances
    const complete = await prisma.exitRequest.findUnique({
      where: { id: exitRequest.id },
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

    const instance = {
      id: complete!.id,
      offboardingCode: `OFF-${complete!.id.slice(0, 8).toUpperCase()}`,
      employeeId: complete!.employeeId,
      employeeName: complete!.employee
        ? `${complete!.employee.firstName} ${complete!.employee.lastName}`
        : '',
      offboardingType: complete!.exitType.toLowerCase(),
      lastWorkingDate: complete!.lastWorkingDate.toISOString(),
      noticePeriodDays: complete!.noticePeriodDays,
      status: complete!.status.toLowerCase(),
      clearanceStatus: complete!.clearanceStatus,
      progress: 0,
      clearances: complete!.clearances,
      createdDate: complete!.createdAt.toISOString(),
      lastModified: complete!.updatedAt.toISOString(),
    };

    return NextResponse.json(
      { success: true, instance },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating offboarding instance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create offboarding instance' },
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
        { success: false, error: 'Instance ID is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.exitRequest.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Offboarding instance not found' },
        { status: 404 }
      );
    }

    const dataToUpdate: Record<string, unknown> = {};

    if (updates.status) {
      dataToUpdate.status = updates.status.toUpperCase();
    }
    if (updates.clearanceStatus) {
      dataToUpdate.clearanceStatus = updates.clearanceStatus.toUpperCase();
    }
    if (updates.lastWorkingDate) {
      dataToUpdate.lastWorkingDate = new Date(updates.lastWorkingDate);
    }
    if (updates.noticePeriodDays !== undefined) {
      dataToUpdate.noticePeriodDays = updates.noticePeriodDays;
    }
    if (updates.notes !== undefined) {
      dataToUpdate.reason = updates.notes;
    }
    if (updates.rehireEligibility !== undefined) {
      dataToUpdate.rehireEligible =
        updates.rehireEligibility !== 'not_eligible';
    }
    if (updates.settlementAmount !== undefined) {
      dataToUpdate.settlementAmount = updates.settlementAmount;
    }

    const exitRequest = await prisma.exitRequest.update({
      where: { id },
      data: dataToUpdate,
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

    const totalClearances = exitRequest.clearances.length;
    const completedClearances = exitRequest.clearances.filter(
      (c) => c.status === 'APPROVED'
    ).length;
    const progress =
      totalClearances > 0
        ? Math.round((completedClearances / totalClearances) * 100)
        : 0;

    const instance = {
      id: exitRequest.id,
      offboardingCode: `OFF-${exitRequest.id.slice(0, 8).toUpperCase()}`,
      employeeId: exitRequest.employeeId,
      employeeName: exitRequest.employee
        ? `${exitRequest.employee.firstName} ${exitRequest.employee.lastName}`
        : '',
      offboardingType: exitRequest.exitType.toLowerCase(),
      lastWorkingDate: exitRequest.lastWorkingDate.toISOString(),
      noticePeriodDays: exitRequest.noticePeriodDays,
      status: exitRequest.status.toLowerCase(),
      clearanceStatus: exitRequest.clearanceStatus,
      progress,
      clearances: exitRequest.clearances,
      createdDate: exitRequest.createdAt.toISOString(),
      lastModified: exitRequest.updatedAt.toISOString(),
    };

    return NextResponse.json(
      { success: true, instance },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating offboarding instance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update offboarding instance' },
      { status: 500 }
    );
  }
});
