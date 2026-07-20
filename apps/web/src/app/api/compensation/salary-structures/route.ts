import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

function serialize(s: any) {
  return {
    id: s.id,
    tenantId: s.tenantId,
    employeeId: s.employeeId,
    effectiveFrom: s.effectiveFrom?.toISOString() || null,
    effectiveTo: s.effectiveTo?.toISOString() || null,
    isActive: s.isActive,
    basicSalary: Number(s.basicSalary),
    houseRentAllowance: Number(s.houseRentAllowance),
    transportAllowance: Number(s.transportAllowance),
    otherAllowances: s.otherAllowances ?? {},
    grossSalary: Number(s.grossSalary),
    ctc: Number(s.ctc),
    payFrequency: s.payFrequency,
    medicalInsurance: Number(s.medicalInsurance),
    lifeInsurance: Number(s.lifeInsurance),
    remarks: s.remarks,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.COMPENSATION, Action.READ, permissions);
    if (permissionError) return permissionError;

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');

    const where: Record<string, unknown> = { tenantId: user.tenantId, isDeleted: false };
    if (employeeId) where.employeeId = employeeId;

    const structures = await prisma.employeeSalaryStructure.findMany({
      where,
      orderBy: { effectiveFrom: 'desc' },
    });
    return NextResponse.json({ success: true, data: structures.map(serialize) });
  } catch (error: any) {
    logger.error('Error fetching salary structures:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch salary structures',
        message: 'Failed to fetch salary structures',
        messageAr: 'فشل جلب هياكل الرواتب',
      },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.COMPENSATION, Action.CREATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    if (!body.employeeId || !body.effectiveFrom) {
      return NextResponse.json(
        {
          success: false,
          error: 'employeeId and effectiveFrom are required',
          message: 'employeeId and effectiveFrom are required',
          messageAr: 'معرّف الموظف وتاريخ السريان مطلوبان',
        },
        { status: 400 }
      );
    }

    const basicSalary = Number(body.basicSalary ?? body.annualBasic) || 0;
    const grossSalary = Number(body.grossSalary ?? body.annualGross) || 0;
    const ctc = Number(body.ctc ?? body.annualCTC) || 0;

    const structure = await prisma.employeeSalaryStructure.create({
      data: {
        tenantId: user.tenantId,
        employeeId: body.employeeId,
        effectiveFrom: new Date(body.effectiveFrom),
        effectiveTo: body.effectiveTo ? new Date(body.effectiveTo) : null,
        isActive: body.isActive ?? true,
        basicSalary,
        houseRentAllowance: Number(body.houseRentAllowance) || 0,
        transportAllowance: Number(body.transportAllowance) || 0,
        otherAllowances: body.otherAllowances ?? undefined,
        grossSalary,
        ctc,
        payFrequency: (body.payFrequency || 'MONTHLY').toUpperCase(),
        medicalInsurance: Number(body.medicalInsurance) || 0,
        lifeInsurance: Number(body.lifeInsurance) || 0,
        remarks: body.remarks || null,
        createdBy: user.userId,
      },
    });

    return NextResponse.json({ success: true, data: serialize(structure) }, { status: 201 });
  } catch (error: any) {
    logger.error('Error creating salary structure:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create salary structure',
        message: 'Failed to create salary structure',
        messageAr: 'فشل إنشاء هيكل الراتب',
      },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.COMPENSATION, Action.UPDATE, permissions);
    if (permissionError) return permissionError;

    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Structure ID is required',
          message: 'Structure ID is required',
          messageAr: 'معرّف الهيكل مطلوب',
        },
        { status: 400 }
      );
    }

    const existing = await prisma.employeeSalaryStructure.findFirst({
      where: { id, tenantId: user.tenantId, isDeleted: false },
    });
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Structure not found',
          message: 'Structure not found',
          messageAr: 'الهيكل غير موجود',
        },
        { status: 404 }
      );
    }

    const updateData: Record<string, unknown> = { updatedBy: user.userId };
    if (body.effectiveFrom) updateData.effectiveFrom = new Date(body.effectiveFrom);
    if (body.effectiveTo !== undefined)
      updateData.effectiveTo = body.effectiveTo ? new Date(body.effectiveTo) : null;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;
    if (body.basicSalary !== undefined || body.annualBasic !== undefined)
      updateData.basicSalary = Number(body.basicSalary ?? body.annualBasic) || 0;
    if (body.houseRentAllowance !== undefined)
      updateData.houseRentAllowance = Number(body.houseRentAllowance) || 0;
    if (body.transportAllowance !== undefined)
      updateData.transportAllowance = Number(body.transportAllowance) || 0;
    if (body.otherAllowances !== undefined) updateData.otherAllowances = body.otherAllowances;
    if (body.grossSalary !== undefined || body.annualGross !== undefined)
      updateData.grossSalary = Number(body.grossSalary ?? body.annualGross) || 0;
    if (body.ctc !== undefined || body.annualCTC !== undefined)
      updateData.ctc = Number(body.ctc ?? body.annualCTC) || 0;
    if (body.payFrequency) updateData.payFrequency = String(body.payFrequency).toUpperCase();
    if (body.medicalInsurance !== undefined)
      updateData.medicalInsurance = Number(body.medicalInsurance) || 0;
    if (body.lifeInsurance !== undefined)
      updateData.lifeInsurance = Number(body.lifeInsurance) || 0;
    if (body.remarks !== undefined) updateData.remarks = body.remarks;

    // tenant-ok: id-based update preceded by tenant-scoped findFirst above
    const structure = await prisma.employeeSalaryStructure.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: serialize(structure) });
  } catch (error: any) {
    logger.error('Error updating salary structure:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update salary structure',
        message: 'Failed to update salary structure',
        messageAr: 'فشل تحديث هيكل الراتب',
      },
      { status: 500 }
    );
  }
});
