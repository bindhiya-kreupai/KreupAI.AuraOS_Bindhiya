import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

// ===== Validation Schemas =====
const createAssessmentSchema = z.object({
  assessmentCode: z.string().min(1, 'Assessment code is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  courseId: z.string().optional(),
  type: z.enum(['QUIZ', 'EXAM', 'ASSIGNMENT', 'PRACTICAL', 'PROJECT', 'CERTIFICATION']),
  duration: z.number().positive().optional(),
  totalPoints: z.number().positive(),
  passingScore: z.number().min(0).max(100),
  maxAttempts: z.number().positive().optional(),
  isRandomized: z.boolean().optional(),
  showResults: z.boolean().optional(),
  allowReview: z.boolean().optional(),
  questions: z.any(),
  instructions: z.string().optional(),
  isActive: z.boolean().optional(),
});

const updateAssessmentSchema = z.object({
  id: z.string().min(1, 'Assessment ID is required'),
  title: z.string().optional(),
  description: z.string().optional(),
  duration: z.number().optional(),
  totalPoints: z.number().optional(),
  passingScore: z.number().optional(),
  questions: z.any().optional(),
  isActive: z.boolean().optional(),
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

    // Filter by course
    const courseId = searchParams.get('courseId');
    if (courseId) {
      where.courseId = courseId;
    }

    // Filter by type
    const type = searchParams.get('type');
    if (type) {
      where.type = type;
    }

    // Filter by active status
    const isActive = searchParams.get('isActive');
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Fetch assessments
    const [assessments, total] = await Promise.all([
      prisma.assessment.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
        include: {
          course: {
            select: {
              id: true,
              title: true,
              courseCode: true,
            },
          },
          attempts: {
            select: {
              id: true,
              learnerId: true,
              passed: true,
            },
          },
        },
      }),
      prisma.assessment.count({ where }),
    ]);

    return NextResponse.json(
      {
        assessments,
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
    console.error('Error fetching assessments:', error);
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
    const validatedData = createAssessmentSchema.parse(body);

    // Check if assessment code already exists
    const existing = await prisma.assessment.findFirst({
      where: {
        tenantId: user.tenantId,
        assessmentCode: validatedData.assessmentCode,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Assessment code already exists' },
        { status: 400 }
      );
    }

    // Create assessment
    const assessment = await prisma.assessment.create({
      data: {
        tenantId: user.tenantId,
        assessmentCode: validatedData.assessmentCode,
        title: validatedData.title,
        description: validatedData.description,
        courseId: validatedData.courseId,
        type: validatedData.type,
        duration: validatedData.duration,
        totalPoints: validatedData.totalPoints,
        passingScore: validatedData.passingScore,
        maxAttempts: validatedData.maxAttempts,
        isRandomized: validatedData.isRandomized ?? false,
        showResults: validatedData.showResults ?? true,
        allowReview: validatedData.allowReview ?? true,
        questions: validatedData.questions as any,
        instructions: validatedData.instructions,
        isActive: validatedData.isActive ?? true,
        createdBy: user.userId,
      },
    });

    return NextResponse.json(
      { assessment },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating assessment:', error);
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
    const validatedData = updateAssessmentSchema.parse(body);
    const { id, ...updateData } = validatedData;

    // Verify assessment exists and belongs to tenant
    const existingAssessment = await prisma.assessment.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    });

    if (!existingAssessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const dataToUpdate: any = {};

    if (updateData.title !== undefined) dataToUpdate.title = updateData.title;
    if (updateData.description !== undefined) dataToUpdate.description = updateData.description;
    if (updateData.duration !== undefined) dataToUpdate.duration = updateData.duration;
    if (updateData.totalPoints !== undefined) dataToUpdate.totalPoints = updateData.totalPoints;
    if (updateData.passingScore !== undefined) dataToUpdate.passingScore = updateData.passingScore;
    if (updateData.questions !== undefined) dataToUpdate.questions = updateData.questions as any;
    if (updateData.isActive !== undefined) dataToUpdate.isActive = updateData.isActive;

    // Update assessment
    const assessment = await prisma.assessment.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(
      { assessment },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating assessment:', error);
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
        { error: 'Assessment ID is required' },
        { status: 400 }
      );
    }

    // Verify assessment exists and belongs to tenant
    const existingAssessment = await prisma.assessment.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
      include: {
        attempts: true,
      },
    });

    if (!existingAssessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      );
    }

    // Prevent deletion if there are attempts
    if (existingAssessment.attempts.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete assessment with existing attempts. Deactivate it instead.' },
        { status: 400 }
      );
    }

    // Delete assessment
    await prisma.assessment.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Assessment deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting assessment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
