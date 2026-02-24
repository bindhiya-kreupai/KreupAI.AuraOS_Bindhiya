import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { z } from 'zod';

// Validation schema for creating a department / org unit
const createDepartmentSchema = z.object({
  companyId: z.string().uuid('Valid company ID is required'),
  code: z.string().min(1, 'Department code is required'),
  name: z.string().min(1, 'Department name is required'),
  parentId: z.string().uuid().optional().nullable(),
  costCenterId: z.string().uuid().optional().nullable(),
});

// Validation schema for updating a department / org unit
const updateDepartmentSchema = z.object({
  id: z.string().uuid('Valid department ID is required'),
  companyId: z.string().uuid().optional(),
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  parentId: z.string().uuid().optional().nullable(),
  costCenterId: z.string().uuid().optional().nullable(),
});

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';
    const companyId = searchParams.get('companyId');

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (companyId) {
      where.companyId = companyId;
    }

    const departments = await prisma.department.findMany({
      where,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        costCenter: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            employees: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Map to the units format the frontend expects
    const units = departments.map((dept) => ({
      id: dept.id,
      name: dept.name,
      code: dept.code,
      companyId: dept.companyId,
      companyName: dept.company?.name ?? null,
      parentId: dept.parentId,
      parentName: dept.parent?.name ?? null,
      headCount: dept._count.employees,
      costCenterId: dept.costCenterId,
      costCenter: dept.costCenter
        ? { id: dept.costCenter.id, code: dept.costCenter.code, name: dept.costCenter.name }
        : null,
      children: dept.children,
    }));

    return NextResponse.json({ units }, { status: 200 });
  } catch (error) {
    console.error('GET /api/core-hr/organization error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Validate input
    const validation = createDepartmentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check for duplicate code within the same company
    const existingDept = await prisma.department.findFirst({
      where: {
        companyId: data.companyId,
        code: data.code,
      },
    });

    if (existingDept) {
      return NextResponse.json(
        { error: 'A department with this code already exists in this company' },
        { status: 409 }
      );
    }

    const department = await prisma.department.create({
      data: {
        companyId: data.companyId,
        code: data.code,
        name: data.name,
        parentId: data.parentId ?? undefined,
        costCenterId: data.costCenterId ?? undefined,
      },
      include: {
        parent: {
          select: { id: true, name: true, code: true },
        },
        children: {
          select: { id: true, name: true, code: true },
        },
        costCenter: true,
        company: {
          select: { id: true, name: true },
        },
        _count: {
          select: { employees: true },
        },
      },
    });

    const unit = {
      id: department.id,
      name: department.name,
      code: department.code,
      companyId: department.companyId,
      companyName: department.company?.name ?? null,
      parentId: department.parentId,
      parentName: department.parent?.name ?? null,
      headCount: department._count.employees,
      costCenterId: department.costCenterId,
      costCenter: department.costCenter
        ? { id: department.costCenter.id, code: department.costCenter.code, name: department.costCenter.name }
        : null,
      children: department.children,
    };

    return NextResponse.json({ unit }, { status: 201 });
  } catch (error) {
    console.error('POST /api/core-hr/organization error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Validate input
    const validation = updateDepartmentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { id, ...updateData } = validation.data;

    // Check department exists
    const existing = await prisma.department.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    // If code is being updated, check for duplicates within the same company
    if (updateData.code) {
      const companyId = updateData.companyId || existing.companyId;
      const codeTaken = await prisma.department.findFirst({
        where: {
          companyId,
          code: updateData.code,
          NOT: { id },
        },
      });
      if (codeTaken) {
        return NextResponse.json(
          { error: 'A department with this code already exists in this company' },
          { status: 409 }
        );
      }
    }

    const department = await prisma.department.update({
      where: { id },
      data: updateData,
      include: {
        parent: {
          select: { id: true, name: true, code: true },
        },
        children: {
          select: { id: true, name: true, code: true },
        },
        costCenter: true,
        company: {
          select: { id: true, name: true },
        },
        _count: {
          select: { employees: true },
        },
      },
    });

    const unit = {
      id: department.id,
      name: department.name,
      code: department.code,
      companyId: department.companyId,
      companyName: department.company?.name ?? null,
      parentId: department.parentId,
      parentName: department.parent?.name ?? null,
      headCount: department._count.employees,
      costCenterId: department.costCenterId,
      costCenter: department.costCenter
        ? { id: department.costCenter.id, code: department.costCenter.code, name: department.costCenter.name }
        : null,
      children: department.children,
    };

    return NextResponse.json({ unit }, { status: 200 });
  } catch (error) {
    console.error('PUT /api/core-hr/organization error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
