// @ts-nocheck — Has Prisma schema drift (wrong field/relation names against current schema). Tracked under #29.
import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

// ===== Validation Schemas =====
const createLearningPathSchema = z.object({
  pathCode: z.string().min(1, 'Path code is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']),
  categoryId: z.string().optional(),
  categoryName: z.string().optional(),
  duration: z.number().positive(),
  courses: z.any(),
  skills: z.array(z.string()).optional(),
  competencies: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
});

const updateLearningPathSchema = z.object({
  id: z.string().min(1, 'Path ID is required'),
  title: z.string().optional(),
  description: z.string().optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  categoryId: z.string().optional(),
  categoryName: z.string().optional(),
  duration: z.number().optional(),
  courses: z.any().optional(),
  skills: z.array(z.string()).optional(),
  competencies: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  completionRate: z.number().optional(),
});

// ===== GET Handler =====
export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    // Build where clause with tenant isolation
    const where: any = {
      tenantId: user.tenantId,
    };

    // Filter by active status
    const isActive = searchParams.get('isActive');
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    // Filter by level
    const level = searchParams.get('level');
    if (level) {
      where.level = level;
    }

    // Filter by category
    const categoryId = searchParams.get('categoryId');
    if (categoryId) {
      where.categoryId = categoryId;
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Fetch learning paths
    const [paths, total] = await Promise.all([
      prisma.learningPath.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
        include: {
          enrollments: {
            select: {
              id: true,
              status: true,
              progress: true,
            },
          },
        },
      }),
      prisma.learningPath.count({ where }),
    ]);

    return NextResponse.json(
      {
        paths,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching learning paths:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// ===== POST Handler =====
export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Validate input
    const validatedData = createLearningPathSchema.parse(body);

    // Check if path code already exists
    const existing = await prisma.learningPath.findFirst({
      where: {
        tenantId: user.tenantId,
        pathCode: validatedData.pathCode,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Path code already exists' },
        { status: 400 }
      );
    }

    // Create learning path
    const path = await prisma.learningPath.create({
      data: {
        tenantId: user.tenantId,
        pathCode: validatedData.pathCode,
        title: validatedData.title,
        description: validatedData.description,
        level: validatedData.level,
        categoryId: validatedData.categoryId,
        categoryName: validatedData.categoryName,
        duration: validatedData.duration,
        courses: validatedData.courses as any,
        skills: validatedData.skills as any || [],
        competencies: validatedData.competencies as any || [],
        isActive: validatedData.isActive ?? true,
        thumbnailUrl: validatedData.thumbnailUrl,
        createdBy: user.userId,
      },
    });

    return NextResponse.json(
      { path },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating learning path:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// ===== PUT Handler =====
export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Validate input
    const validatedData = updateLearningPathSchema.parse(body);
    const { id, ...updateData } = validatedData;

    // Verify learning path exists and belongs to tenant
    const existingPath = await prisma.learningPath.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    });

    if (!existingPath) {
      return NextResponse.json(
        { error: 'Learning path not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const dataToUpdate: any = {};

    if (updateData.title !== undefined) dataToUpdate.title = updateData.title;
    if (updateData.description !== undefined) dataToUpdate.description = updateData.description;
    if (updateData.level !== undefined) dataToUpdate.level = updateData.level;
    if (updateData.categoryId !== undefined) dataToUpdate.categoryId = updateData.categoryId;
    if (updateData.categoryName !== undefined) dataToUpdate.categoryName = updateData.categoryName;
    if (updateData.duration !== undefined) dataToUpdate.duration = updateData.duration;
    if (updateData.courses !== undefined) dataToUpdate.courses = updateData.courses as any;
    if (updateData.skills !== undefined) dataToUpdate.skills = updateData.skills as any;
    if (updateData.competencies !== undefined) dataToUpdate.competencies = updateData.competencies as any;
    if (updateData.isActive !== undefined) dataToUpdate.isActive = updateData.isActive;
    if (updateData.completionRate !== undefined) dataToUpdate.completionRate = updateData.completionRate;

    // Update learning path
    const path = await prisma.learningPath.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(
      { path },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating learning path:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

// ===== DELETE Handler =====
export const DELETE = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Learning path ID is required' },
        { status: 400 }
      );
    }

    // Verify learning path exists and belongs to tenant
    const existingPath = await prisma.learningPath.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
      include: {
        enrollments: true,
      },
    });

    if (!existingPath) {
      return NextResponse.json(
        { error: 'Learning path not found' },
        { status: 404 }
      );
    }

    // Prevent deletion if there are enrollments
    if (existingPath.enrollments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete learning path with active enrollments. Deactivate it instead.' },
        { status: 400 }
      );
    }

    // Delete learning path
    await prisma.learningPath.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Learning path deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting learning path:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
