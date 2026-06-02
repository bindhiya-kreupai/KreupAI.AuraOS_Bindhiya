import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.COMPENSATION, Action.READ, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const { searchParams } = new URL(request.url);
      const employeeId = searchParams.get('employeeId');
      const isActive = searchParams.get('isActive');

      const where: Record<string, unknown> = { tenantId };
      if (employeeId) where.employeeId = employeeId;
      if (isActive !== null && isActive !== undefined && isActive !== '') {
        where.isActive = isActive === 'true';
      }

      const salaryStructures = await prisma.employeeSalaryStructure.findMany({
        where,
        orderBy: { effectiveFrom: 'desc' },
      });

      // Transform to match frontend EmployeeCompensation interface
      const compensations = salaryStructures.map((ss) => ({
        id: ss.id,
        employeeId: ss.employeeId,
        tenantId: ss.tenantId,
        effectiveFrom: ss.effectiveFrom.toISOString(),
        effectiveTo: ss.effectiveTo?.toISOString() || null,
        isActive: ss.isActive,
        annualCTC: Number(ss.ctc),
        monthlyCTC: Number(ss.ctc) / 12,
        annualGross: Number(ss.grossSalary),
        monthlyGross: Number(ss.grossSalary) / 12,
        annualBasic: Number(ss.basicSalary),
        monthlyBasic: Number(ss.basicSalary) / 12,
        payFrequency: ss.payFrequency?.toLowerCase() || 'monthly',
        currency: 'USD',
        components: [
          {
            componentCode: 'BASIC',
            componentName: 'Basic Salary',
            type: 'earning',
            annualAmount: Number(ss.basicSalary),
            monthlyAmount: Number(ss.basicSalary) / 12,
            isTaxable: true,
            isVariable: false,
          },
          {
            componentCode: 'HRA',
            componentName: 'House Rent Allowance',
            type: 'earning',
            annualAmount: Number(ss.houseRentAllowance),
            monthlyAmount: Number(ss.houseRentAllowance) / 12,
            isTaxable: true,
            isVariable: false,
          },
          {
            componentCode: 'TA',
            componentName: 'Transport Allowance',
            type: 'earning',
            annualAmount: Number(ss.transportAllowance),
            monthlyAmount: Number(ss.transportAllowance) / 12,
            isTaxable: true,
            isVariable: false,
          },
        ],
        remarks: ss.remarks,
        createdBy: ss.createdBy,
        createdAt: ss.createdAt.toISOString(),
        updatedAt: ss.updatedAt.toISOString(),
      }));

      return NextResponse.json({ success: true, data: compensations });
    } catch (error: any) {
      logger.error('Error fetching employee compensation:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch employee compensation' }, { status: 500 });
    }
  }
);

export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.COMPENSATION, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const body = await request.json();

      const compensation = await prisma.employeeSalaryStructure.create({
        data: {
          tenantId,
          employeeId: body.employeeId,
          effectiveFrom: new Date(body.effectiveFrom),
          effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : null,
          isActive: body.isActive ?? true,
          basicSalary: body.annualBasic || body.basicSalary || 0,
          houseRentAllowance: body.houseRentAllowance || 0,
          transportAllowance: body.transportAllowance || 0,
          otherAllowances: body.otherAllowances || null,
          grossSalary: body.annualGross || body.grossSalary || 0,
          ctc: body.annualCTC || body.ctc || 0,
          payFrequency: body.payFrequency?.toUpperCase() || 'MONTHLY',
          medicalInsurance: body.medicalInsurance || 0,
          lifeInsurance: body.lifeInsurance || 0,
          remarks: body.remarks || body.notes || null,
          createdBy: user.userId,
        },
      });

      return NextResponse.json({ success: true, data: compensation }, { status: 201 });
    } catch (error: any) {
      logger.error('Error creating employee compensation:', error);
      return NextResponse.json({ success: false, error: 'Failed to create employee compensation' }, { status: 500 });
    }
  }
);

export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.COMPENSATION, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;
      const body = await request.json();
      const { id, ...updates } = body;

      if (!id) {
        return NextResponse.json({ success: false, error: 'Compensation ID is required' }, { status: 400 });
      }

      const updateData: Record<string, unknown> = {};
      if (updates.effectiveFrom) updateData.effectiveFrom = new Date(updates.effectiveFrom);
      if (updates.effectiveTo) updateData.effectiveTo = new Date(updates.effectiveTo);
      if (updates.isActive !== undefined) updateData.isActive = updates.isActive;
      if (updates.basicSalary || updates.annualBasic) updateData.basicSalary = updates.basicSalary || updates.annualBasic;
      if (updates.grossSalary || updates.annualGross) updateData.grossSalary = updates.grossSalary || updates.annualGross;
      if (updates.ctc || updates.annualCTC) updateData.ctc = updates.ctc || updates.annualCTC;
      if (updates.payFrequency) updateData.payFrequency = updates.payFrequency.toUpperCase();
      if (updates.remarks) updateData.remarks = updates.remarks;

      const compensation = await prisma.employeeSalaryStructure.update({
        where: { id, tenantId },
        data: updateData,
      });

      return NextResponse.json({ success: true, data: compensation });
    } catch (error: any) {
      logger.error('Error updating employee compensation:', error);
      return NextResponse.json({ success: false, error: 'Failed to update employee compensation' }, { status: 500 });
    }
  }
);
