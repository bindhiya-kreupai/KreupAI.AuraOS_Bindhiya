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
      exitType: 'RESIGNATION',
    };

    const employeeId = searchParams.get('employeeId');
    if (employeeId) where.employeeId = employeeId;

    const status = searchParams.get('status');
    if (status) where.status = status.toUpperCase();

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

    // Map to frontend expected shape
    const resignations = exitRequests.map((req) => ({
      id: req.id,
      employeeId: req.employeeId,
      employeeName: req.employee
        ? `${req.employee.firstName} ${req.employee.lastName}`
        : '',
      departmentId: req.employee?.departmentId || '',
      departmentName: '',
      positionId: req.employee?.positionId || '',
      positionTitle: '',
      managerId: '',
      managerName: '',
      submittedDate: req.createdAt.toISOString(),
      lastWorkingDate: req.lastWorkingDate.toISOString(),
      noticePeriodDays: req.noticePeriodDays,
      resignationType: req.exitType.toLowerCase(),
      reason: req.reason || '',
      status: req.status.toLowerCase(),
      rehireEligible: req.rehireEligible,
      settlementAmount: req.settlementAmount
        ? Number(req.settlementAmount)
        : null,
      clearanceStatus: req.clearanceStatus,
      clearances: req.clearances,
      createdDate: req.createdAt.toISOString(),
      lastModified: req.updatedAt.toISOString(),
    }));

    return NextResponse.json(
      { success: true, resignations },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching resignations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch resignations' },
      { status: 500 }
    );
  }
});

// ===== POST Handler =====
export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const exitRequest = await prisma.exitRequest.create({
      data: {
        tenantId: user.tenantId,
        employeeId: body.employeeId,
        exitType: 'RESIGNATION',
        resignationDate: new Date(body.submittedDate || new Date()),
        lastWorkingDate: new Date(body.lastWorkingDate),
        noticePeriodDays: body.noticePeriodDays || 30,
        reason: body.reason || body.detailedReason || null,
        status: 'PENDING',
        clearanceStatus: 'PENDING',
        rehireEligible: body.rehireEligible ?? true,
      },
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

    const resignation = {
      id: exitRequest.id,
      employeeId: exitRequest.employeeId,
      employeeName: exitRequest.employee
        ? `${exitRequest.employee.firstName} ${exitRequest.employee.lastName}`
        : '',
      submittedDate: exitRequest.createdAt.toISOString(),
      lastWorkingDate: exitRequest.lastWorkingDate.toISOString(),
      noticePeriodDays: exitRequest.noticePeriodDays,
      resignationType: exitRequest.exitType.toLowerCase(),
      reason: exitRequest.reason || '',
      status: exitRequest.status.toLowerCase(),
      clearanceStatus: exitRequest.clearanceStatus,
      createdDate: exitRequest.createdAt.toISOString(),
      lastModified: exitRequest.updatedAt.toISOString(),
    };

    return NextResponse.json(
      { success: true, resignation },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating resignation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create resignation' },
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
        { success: false, error: 'Resignation ID is required' },
        { status: 400 }
      );
    }

    // Verify the exit request exists and belongs to tenant
    const existing = await prisma.exitRequest.findFirst({
      where: { id, tenantId: user.tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Resignation not found' },
        { status: 404 }
      );
    }

    // Map frontend status values to database format
    const dataToUpdate: Record<string, unknown> = {};

    if (updates.status) {
      dataToUpdate.status = updates.status.toUpperCase();
    }
    if (updates.lastWorkingDate) {
      dataToUpdate.lastWorkingDate = new Date(updates.lastWorkingDate);
    }
    if (updates.noticePeriodDays !== undefined) {
      dataToUpdate.noticePeriodDays = updates.noticePeriodDays;
    }
    if (updates.reason !== undefined) {
      dataToUpdate.reason = updates.reason;
    }
    if (updates.rehireEligible !== undefined) {
      dataToUpdate.rehireEligible = updates.rehireEligible;
    }
    if (updates.clearanceStatus) {
      dataToUpdate.clearanceStatus = updates.clearanceStatus.toUpperCase();
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

    const resignation = {
      id: exitRequest.id,
      employeeId: exitRequest.employeeId,
      employeeName: exitRequest.employee
        ? `${exitRequest.employee.firstName} ${exitRequest.employee.lastName}`
        : '',
      submittedDate: exitRequest.createdAt.toISOString(),
      lastWorkingDate: exitRequest.lastWorkingDate.toISOString(),
      noticePeriodDays: exitRequest.noticePeriodDays,
      resignationType: exitRequest.exitType.toLowerCase(),
      reason: exitRequest.reason || '',
      status: exitRequest.status.toLowerCase(),
      clearanceStatus: exitRequest.clearanceStatus,
      clearances: exitRequest.clearances,
      createdDate: exitRequest.createdAt.toISOString(),
      lastModified: exitRequest.updatedAt.toISOString(),
    };

    return NextResponse.json(
      { success: true, resignation },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating resignation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update resignation' },
      { status: 500 }
    );
  }
});
