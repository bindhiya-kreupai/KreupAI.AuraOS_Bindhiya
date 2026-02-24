import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

// Alumni records are derived from completed ExitRequests.
// Employees whose exit is completed become alumni records.

// ===== GET Handler =====
export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const where: Record<string, unknown> = {
      tenantId: user.tenantId,
      status: 'COMPLETED',
    };

    const departmentId = searchParams.get('departmentId');
    if (departmentId) {
      where.employee = { departmentId };
    }

    const employeeId = searchParams.get('employeeId');
    if (employeeId) where.employeeId = employeeId;

    // If status is provided, map it to exit request status
    const alumniStatus = searchParams.get('status');
    if (alumniStatus === 'active') {
      where.status = 'COMPLETED';
    } else if (alumniStatus === 'inactive' || alumniStatus === 'opted_out') {
      // For opted_out we would filter by rehireEligible = false
      where.rehireEligible = false;
    }

    const exitRequests = await prisma.exitRequest.findMany({
      where,
      orderBy: { lastWorkingDate: 'desc' },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            departmentId: true,
            positionId: true,
            dateOfJoining: true,
          },
        },
      },
    });

    const alumni = exitRequests.map((req) => {
      const joinDate = req.employee?.dateOfJoining;
      const exitDate = req.lastWorkingDate;
      const tenure = joinDate
        ? Math.round(
            (exitDate.getTime() - new Date(joinDate).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000)
          )
        : 0;

      return {
        id: `ALM-${req.id}`,
        employeeId: req.employeeId,
        employeeName: req.employee
          ? `${req.employee.firstName} ${req.employee.lastName}`
          : '',
        employeeEmail: req.employee?.email || '',
        personalEmail: '',
        departmentId: req.employee?.departmentId || '',
        departmentName: '',
        lastPosition: '',
        joinDate: joinDate ? new Date(joinDate).toISOString() : '',
        exitDate: exitDate.toISOString(),
        tenure,
        exitReason: req.exitType.toLowerCase(),
        status: req.rehireEligible ? 'active' : 'inactive',
        willingToMentor: false,
        willingToRefer: false,
        interestedInReturning: req.rehireEligible,
        events: [],
        createdDate: req.createdAt.toISOString(),
        lastModified: req.updatedAt.toISOString(),
      };
    });

    return NextResponse.json(
      { success: true, alumni },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching alumni:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alumni records' },
      { status: 500 }
    );
  }
});

// ===== POST Handler =====
export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const body = await request.json();

    const alumniRecord = {
      id: body.id || `ALM-${body.employeeId || Date.now()}`,
      employeeId: body.employeeId,
      employeeName: body.employeeName || '',
      employeeEmail: body.employeeEmail || '',
      personalEmail: body.personalEmail || '',
      departmentId: body.departmentId || '',
      departmentName: body.departmentName || '',
      lastPosition: body.lastPosition || '',
      exitDate: body.exitDate,
      exitReason: body.exitReason || '',
      status: 'active',
      willingToMentor: body.willingToMentor ?? false,
      willingToRefer: body.willingToRefer ?? false,
      interestedInReturning: body.interestedInReturning ?? false,
      events: [],
      createdDate: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, alumniRecord },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating alumni record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create alumni record' },
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
        { success: false, error: 'Alumni record ID is required' },
        { status: 400 }
      );
    }

    // If opting out, update the rehireEligible flag on the exit request
    const exitRequestId = id.startsWith('ALM-')
      ? id.replace('ALM-', '')
      : id;

    if (updates.status === 'opted_out') {
      try {
        await prisma.exitRequest.update({
          where: { id: exitRequestId },
          data: { rehireEligible: false },
        });
      } catch {
        // Exit request may not match the ID format
      }
    }

    const alumniRecord = {
      id,
      ...updates,
      lastModified: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, alumniRecord },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating alumni record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update alumni record' },
      { status: 500 }
    );
  }
});
