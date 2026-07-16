import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.COMPENSATION, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    const tenantId = user.tenantId;
    const body = await request.json();
    const { employeeId, newSalary, effectiveFrom, reason } = body;

    if (!employeeId || !newSalary || !effectiveFrom) {
      return NextResponse.json(
        { success: false, error: 'Employee ID, new salary, and effective date are required' },
        { status: 400 }
      );
    }

    // 1. Deactivate current active salary structures for this employee
    await prisma.employeeSalaryStructure.updateMany({
      where: {
        tenantId,
        employeeId,
        isActive: true,
      },
      data: {
        isActive: false,
        effectiveTo: new Date(effectiveFrom),
      },
    });

    // 2. Create new salary structure with revised salary details
    const basicSalary = Number(newSalary) * 0.5;
    const houseRentAllowance = Number(newSalary) * 0.3;
    const transportAllowance = Number(newSalary) * 0.1;
    const grossSalary = basicSalary + houseRentAllowance + transportAllowance;

    const compensation = await prisma.employeeSalaryStructure.create({
      data: {
        tenantId,
        employeeId,
        effectiveFrom: new Date(effectiveFrom),
        isActive: true,
        basicSalary,
        houseRentAllowance,
        transportAllowance,
        grossSalary,
        ctc: Number(newSalary),
        payFrequency: 'MONTHLY',
        remarks: reason || 'Salary revision',
        createdBy: user.userId,
      },
    });

    return NextResponse.json({ success: true, data: compensation }, { status: 201 });
  } catch (error: any) {
    logger.error('Error revising employee compensation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to revise employee compensation' },
      { status: 500 }
    );
  }
});
