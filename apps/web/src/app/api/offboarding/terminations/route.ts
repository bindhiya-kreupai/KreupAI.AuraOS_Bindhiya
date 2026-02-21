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
      exitType: 'TERMINATION',
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

    const terminations = exitRequests.map((req) => ({
      id: req.id,
      employeeId: req.employeeId,
      employeeName: req.employee
        ? `${req.employee.firstName} ${req.employee.lastName}`
        : '',
      departmentId: req.employee?.departmentId || '',
      departmentName: '',
      positionId: req.employee?.positionId || '',
      positionTitle: '',
      terminationType: req.exitType.toLowerCase(),
      terminationDate: req.resignationDate.toISOString(),
      effectiveDate: req.lastWorkingDate.toISOString(),
      noticePeriodDays: req.noticePeriodDays,
      reason: req.reason || '',
      status: req.status.toLowerCase(),
      clearanceStatus: req.clearanceStatus,
      settlementAmount: req.settlementAmount
        ? Number(req.settlementAmount)
        : null,
      rehireEligible: req.rehireEligible,
      clearances: req.clearances,
      createdDate: req.createdAt.toISOString(),
      lastModified: req.updatedAt.toISOString(),
    }));

    return NextResponse.json(
      { success: true, terminations },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching terminations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch terminations' },
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
        exitType: 'TERMINATION',
        resignationDate: new Date(body.terminationDate || new Date()),
        lastWorkingDate: new Date(body.effectiveDate || body.lastWorkingDate),
        noticePeriodDays: body.noticePeriodDays || 0,
        reason: body.reason || body.detailedJustification || null,
        status: 'PENDING',
        clearanceStatus: 'PENDING',
        rehireEligible: body.rehireEligible ?? false,
        settlementAmount: body.severancePay || null,
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

    const termination = {
      id: exitRequest.id,
      employeeId: exitRequest.employeeId,
      employeeName: exitRequest.employee
        ? `${exitRequest.employee.firstName} ${exitRequest.employee.lastName}`
        : '',
      terminationType: exitRequest.exitType.toLowerCase(),
      terminationDate: exitRequest.resignationDate.toISOString(),
      effectiveDate: exitRequest.lastWorkingDate.toISOString(),
      noticePeriodDays: exitRequest.noticePeriodDays,
      reason: exitRequest.reason || '',
      status: exitRequest.status.toLowerCase(),
      clearanceStatus: exitRequest.clearanceStatus,
      rehireEligible: exitRequest.rehireEligible,
      createdDate: exitRequest.createdAt.toISOString(),
      lastModified: exitRequest.updatedAt.toISOString(),
    };

    return NextResponse.json(
      { success: true, termination },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating termination:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create termination' },
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
        { success: false, error: 'Termination ID is required' },
        { status: 400 }
      );
    }

    const existing = await prisma.exitRequest.findFirst({
      where: { id, tenantId: user.tenantId, exitType: 'TERMINATION' },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Termination not found' },
        { status: 404 }
      );
    }

    const dataToUpdate: Record<string, unknown> = {};

    if (updates.status) {
      dataToUpdate.status = updates.status.toUpperCase();
    }
    if (updates.effectiveDate || updates.lastWorkingDate) {
      dataToUpdate.lastWorkingDate = new Date(
        updates.effectiveDate || updates.lastWorkingDate
      );
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
    if (updates.settlementAmount !== undefined || updates.severancePay !== undefined) {
      dataToUpdate.settlementAmount =
        updates.settlementAmount ?? updates.severancePay;
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

    const termination = {
      id: exitRequest.id,
      employeeId: exitRequest.employeeId,
      employeeName: exitRequest.employee
        ? `${exitRequest.employee.firstName} ${exitRequest.employee.lastName}`
        : '',
      terminationType: exitRequest.exitType.toLowerCase(),
      terminationDate: exitRequest.resignationDate.toISOString(),
      effectiveDate: exitRequest.lastWorkingDate.toISOString(),
      noticePeriodDays: exitRequest.noticePeriodDays,
      reason: exitRequest.reason || '',
      status: exitRequest.status.toLowerCase(),
      clearanceStatus: exitRequest.clearanceStatus,
      rehireEligible: exitRequest.rehireEligible,
      clearances: exitRequest.clearances,
      createdDate: exitRequest.createdAt.toISOString(),
      lastModified: exitRequest.updatedAt.toISOString(),
    };

    return NextResponse.json(
      { success: true, termination },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating termination:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update termination' },
      { status: 500 }
    );
  }
});
