import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

// Final settlements are derived from ExitRequest.settlementAmount and status.
// ExitRequest fields used: settlementAmount, status, clearanceStatus.

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

    const status = searchParams.get('status');
    if (status) {
      // Map settlement statuses to exit request statuses
      if (status === 'paid') {
        where.status = 'COMPLETED';
        where.settlementAmount = { not: null };
      } else if (status === 'approved') {
        where.status = 'APPROVED';
      }
    }

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

    const settlements = exitRequests.map((req) => {
      const amount = req.settlementAmount ? Number(req.settlementAmount) : 0;

      // Derive settlement status from exit request status
      let settlementStatus = 'pending_calculation';
      if (req.status === 'COMPLETED') settlementStatus = 'paid';
      else if (req.status === 'APPROVED') settlementStatus = 'approved';
      else if (req.status === 'PROCESSING') settlementStatus = 'calculated';
      else if (amount > 0) settlementStatus = 'calculated';

      return {
        id: `SET-${req.id}`,
        offboardingId: req.id,
        employeeId: req.employeeId,
        employeeName: req.employee
          ? `${req.employee.firstName} ${req.employee.lastName}`
          : '',
        employeeBankAccount: '',
        calculationDate: req.createdAt.toISOString(),
        paymentDueDate: req.lastWorkingDate.toISOString(),
        paymentDate: req.status === 'COMPLETED'
          ? req.updatedAt.toISOString()
          : null,
        status: settlementStatus,
        components: [],
        earnings: [],
        deductions: [],
        totalEarnings: amount,
        totalDeductions: 0,
        netPayable: amount,
        paymentMethod: 'bank_transfer' as const,
        calculatedBy: '',
        clearanceStatus: req.clearanceStatus,
        lastWorkingDate: req.lastWorkingDate.toISOString(),
        createdDate: req.createdAt.toISOString(),
        lastModified: req.updatedAt.toISOString(),
      };
    });

    return NextResponse.json(
      { success: true, settlements },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching final settlements:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch final settlements' },
      { status: 500 }
    );
  }
});

// ===== POST Handler =====
export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // If an offboardingId exists, update the settlement amount on the exit request
    if (body.offboardingId) {
      const existing = await prisma.exitRequest.findFirst({
        where: { id: body.offboardingId, tenantId: user.tenantId },
      });

      if (existing) {
        await prisma.exitRequest.update({
          where: { id: body.offboardingId },
          data: {
            settlementAmount: body.netPayable || body.totalEarnings || 0,
          },
        });
      }
    }

    const settlement = {
      id: body.id || `SET-${body.offboardingId || Date.now()}`,
      offboardingId: body.offboardingId,
      employeeId: body.employeeId,
      employeeName: body.employeeName || '',
      status: 'pending_calculation',
      netPayable: body.netPayable || 0,
      totalEarnings: body.totalEarnings || 0,
      totalDeductions: body.totalDeductions || 0,
      components: body.components || [],
      earnings: body.earnings || [],
      deductions: body.deductions || [],
      createdDate: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, settlement },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating final settlement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create final settlement' },
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
        { success: false, error: 'Settlement ID is required' },
        { status: 400 }
      );
    }

    // Extract exitRequestId from settlement ID
    const exitRequestId = id.startsWith('SET-')
      ? id.replace('SET-', '')
      : id;

    const existing = await prisma.exitRequest.findFirst({
      where: { id: exitRequestId, tenantId: user.tenantId },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Settlement not found' },
        { status: 404 }
      );
    }

    const dataToUpdate: Record<string, unknown> = {};

    // Map settlement status to exit request status
    if (updates.status === 'approved') {
      dataToUpdate.status = 'APPROVED';
    } else if (updates.status === 'paid') {
      dataToUpdate.status = 'COMPLETED';
    }

    if (updates.netPayable !== undefined) {
      dataToUpdate.settlementAmount = updates.netPayable;
    }

    if (Object.keys(dataToUpdate).length > 0) {
      await prisma.exitRequest.update({
        where: { id: exitRequestId },
        data: dataToUpdate,
      });
    }

    const settlement = {
      id,
      offboardingId: exitRequestId,
      ...updates,
      lastModified: new Date().toISOString(),
    };

    return NextResponse.json(
      { success: true, settlement },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating final settlement:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update final settlement' },
      { status: 500 }
    );
  }
});
