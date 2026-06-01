import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { z } from 'zod';

// Validation schemas
const CreatePositionSchema = z.object({
  positionCode: z.string().min(1, 'Position code is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  departmentId: z.string().min(1, 'Department ID is required'),
  locationId: z.string().optional(),
  reportsToPositionId: z.string().optional(),
  jobProfileId: z.string().optional(),
  gradeId: z.string().optional(),
  headcount: z.number().int().positive().optional(),
  fte: z.number().positive().optional(),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  salaryCurrency: z.string().optional(),
  annualBudget: z.number().optional(),
  status: z.enum(['DRAFT', 'OPEN', 'FILLED', 'FROZEN', 'CLOSED']).optional(),
  effectiveDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

const UpdatePositionSchema = z.object({
  id: z.string().min(1, 'Position ID is required'),
  positionCode: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  departmentId: z.string().min(1).optional(),
  locationId: z.string().optional().nullable(),
  reportsToPositionId: z.string().optional().nullable(),
  jobProfileId: z.string().optional().nullable(),
  gradeId: z.string().optional().nullable(),
  headcount: z.number().int().positive().optional(),
  fte: z.number().positive().optional(),
  filledCount: z.number().int().min(0).optional(),
  vacantCount: z.number().int().min(0).optional(),
  salaryMin: z.number().optional().nullable(),
  salaryMax: z.number().optional().nullable(),
  salaryCurrency: z.string().optional().nullable(),
  annualBudget: z.number().optional().nullable(),
  status: z.enum(['DRAFT', 'OPEN', 'FILLED', 'FROZEN', 'CLOSED']).optional(),
  effectiveDate: z.string().datetime().optional().nullable(),
  closedDate: z.string().datetime().optional().nullable(),
  isActive: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search') || undefined;
    const departmentId = searchParams.get('departmentId') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Build where clause
    const where: any = {
      tenantId: user.tenantId,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { positionCode: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (status) {
      where.status = status;
    }

    const [positions, total] = await Promise.all([
      prisma.position.findMany({
        where,
        include: {
          department: { select: { id: true, name: true, code: true } },
          location: { select: { id: true, name: true, code: true } },
          jobProfile: { select: { id: true, title: true, code: true } },
          grade: { select: { id: true, name: true, code: true, level: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.position.count({ where }),
    ]);

    return NextResponse.json({
      positions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching positions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch positions' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const validated = CreatePositionSchema.parse(body);

    // Check for duplicate position code within tenant
    const existing = await prisma.position.findFirst({
      where: {
        tenantId: user.tenantId,
        positionCode: validated.positionCode,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Position with this code already exists' },
        { status: 400 }
      );
    }

    const position = await prisma.position.create({
      data: {
        tenantId: user.tenantId,
        positionCode: validated.positionCode,
        title: validated.title,
        description: validated.description,
        departmentId: validated.departmentId,
        locationId: validated.locationId,
        reportsToPositionId: validated.reportsToPositionId,
        jobProfileId: validated.jobProfileId,
        gradeId: validated.gradeId,
        headcount: validated.headcount ?? 1,
        fte: validated.fte ?? 1.0,
        salaryMin: validated.salaryMin,
        salaryMax: validated.salaryMax,
        salaryCurrency: validated.salaryCurrency,
        annualBudget: validated.annualBudget,
        status: validated.status ?? 'DRAFT',
        effectiveDate: validated.effectiveDate ? new Date(validated.effectiveDate) : undefined,
        notes: validated.notes,
      },
      include: {
        department: { select: { id: true, name: true, code: true } },
        location: { select: { id: true, name: true, code: true } },
        jobProfile: { select: { id: true, title: true, code: true } },
        grade: { select: { id: true, name: true, code: true, level: true } },
      },
    });

    return NextResponse.json({ position }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating position:', error);
    return NextResponse.json(
      { error: 'Failed to create position' },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const validated = UpdatePositionSchema.parse(body);
    const { id, ...updateData } = validated;

    // Verify position exists and belongs to tenant
    const existing = await prisma.position.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Position not found' },
        { status: 404 }
      );
    }

    // If positionCode is being changed, check for duplicates
    if (updateData.positionCode && updateData.positionCode !== existing.positionCode) {
      const duplicate = await prisma.position.findFirst({
        where: {
          tenantId: user.tenantId,
          positionCode: updateData.positionCode,
          id: { not: id },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { error: 'Position with this code already exists' },
          { status: 400 }
        );
      }
    }

    // Transform date strings to Date objects
    const data: any = { ...updateData };
    if (data.effectiveDate) data.effectiveDate = new Date(data.effectiveDate);
    if (data.closedDate) data.closedDate = new Date(data.closedDate);

    const position = await prisma.position.update({
      where: { id },
      data,
      include: {
        department: { select: { id: true, name: true, code: true } },
        location: { select: { id: true, name: true, code: true } },
        jobProfile: { select: { id: true, title: true, code: true } },
        grade: { select: { id: true, name: true, code: true, level: true } },
      },
    });

    return NextResponse.json({ position }, { status: 200 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating position:', error);
    return NextResponse.json(
      { error: 'Failed to update position' },
      { status: 500 }
    );
  }
});
