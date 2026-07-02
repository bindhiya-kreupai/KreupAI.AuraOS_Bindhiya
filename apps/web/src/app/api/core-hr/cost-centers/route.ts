import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { z } from 'zod';

// Validation schema for creating a cost center
const createCostCenterSchema = z.object({
  code: z.string().min(1, 'Cost center code is required'),
  name: z.string().min(1, 'Cost center name is required'),
});

// Validation schema for updating a cost center
const updateCostCenterSchema = z.object({
  id: z.string().uuid('Valid cost center ID is required'),
  code: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  fiscalYear: z.number().int().optional(),
  allocatedBudget: z.number().nonnegative().optional(),
  spentBudget: z.number().nonnegative().optional(),
  // Nested budget object accepted from the UI mapper for convenience
  budget: z
    .object({
      totalBudget: z.number().nonnegative().optional(),
      allocatedBudget: z.number().nonnegative().optional(),
      spentBudget: z.number().nonnegative().optional(),
    })
    .optional(),
});

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || '';

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    where.isDeleted = false;

    const costCenters = await prisma.costCenter.findMany({
      where,
      include: {
        _count: {
          select: {
            departments: true,
          },
        },
        departments: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Map to include departmentCount and a normalized budget object for the UI
    const mappedCostCenters = costCenters.map((cc: any) => {
      const allocated = Number(cc.allocatedBudget ?? 0);
      const spent = Number(cc.spentBudget ?? 0);
      return {
        id: cc.id,
        code: cc.code,
        name: cc.name,
        fiscalYear: cc.fiscalYear,
        departmentCount: cc._count.departments,
        departments: cc.departments,
        budget: {
          totalBudget: allocated,
          allocatedBudget: allocated,
          spentBudget: spent,
          remainingBudget: Math.max(allocated - spent, 0),
        },
      };
    });

    return NextResponse.json({ costCenters: mappedCostCenters }, { status: 200 });
  } catch (error: any) {
    console.error('GET /api/core-hr/cost-centers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Validate input
    const validation = createCostCenterSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check for duplicate code (unique constraint on CostCenter.code)
    const existingCode = await prisma.costCenter.findUnique({
      where: { code: data.code },
    });

    if (existingCode) {
      return NextResponse.json(
        { error: 'A cost center with this code already exists' },
        { status: 409 }
      );
    }

    const costCenter = await prisma.costCenter.create({
      data: {
        code: data.code,
        name: data.name,
      },
      include: {
        _count: {
          select: { departments: true },
        },
        departments: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    return NextResponse.json(
      {
        costCenter: {
          id: costCenter.id,
          code: costCenter.code,
          name: costCenter.name,
          departmentCount: costCenter._count.departments,
          departments: costCenter.departments,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('POST /api/core-hr/cost-centers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Validate input
    const validation = updateCostCenterSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { id, budget, ...updateData } = validation.data;

    // Check cost center exists
    const existing = await prisma.costCenter.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Cost center not found' }, { status: 404 });
    }

    // If code is being updated, check for duplicates
    if (updateData.code && updateData.code !== existing.code) {
      const codeTaken = await prisma.costCenter.findUnique({
        where: { code: updateData.code },
      });
      if (codeTaken) {
        return NextResponse.json(
          { error: 'A cost center with this code already exists' },
          { status: 409 }
        );
      }
    }

    // Fold the nested budget object into scalar columns.
    const data: any = { ...updateData, updatedBy: user.userId };
    if (budget) {
      if (budget.totalBudget !== undefined || budget.allocatedBudget !== undefined) {
        data.allocatedBudget = budget.allocatedBudget ?? budget.totalBudget;
      }
      if (budget.spentBudget !== undefined) {
        data.spentBudget = budget.spentBudget;
      }
    }

    const costCenter: any = await prisma.costCenter.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { departments: true },
        },
        departments: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    const allocated = Number(costCenter.allocatedBudget ?? 0);
    const spent = Number(costCenter.spentBudget ?? 0);

    return NextResponse.json(
      {
        costCenter: {
          id: costCenter.id,
          code: costCenter.code,
          name: costCenter.name,
          fiscalYear: costCenter.fiscalYear,
          departmentCount: costCenter._count.departments,
          departments: costCenter.departments,
          budget: {
            totalBudget: allocated,
            allocatedBudget: allocated,
            spentBudget: spent,
            remainingBudget: Math.max(allocated - spent, 0),
          },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('PUT /api/core-hr/cost-centers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
