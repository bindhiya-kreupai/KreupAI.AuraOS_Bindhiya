import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

// ===== Validation Schemas =====
const createFeedbackSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  providedBy: z.string().min(1, 'Provider ID is required'),
  type: z.enum(['RECOGNITION', 'CONSTRUCTIVE', 'CONTINUOUS', 'FORMAL']),
  content: z.string().min(10, 'Feedback content must be at least 10 characters'),
  isPrivate: z.boolean().optional(),
  isAnonymous: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

const updateFeedbackSchema = z.object({
  id: z.string().min(1, 'Feedback ID is required'),
  content: z.string().min(10, 'Feedback content must be at least 10 characters').optional(),
  isPrivate: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
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

    // Filter by employee
    const employeeId = searchParams.get('employeeId');
    if (employeeId) {
      where.employeeId = employeeId;
    }

    // Filter by provider
    const providedBy = searchParams.get('providedBy');
    if (providedBy) {
      where.providedBy = providedBy;
    }

    // Filter by feedback type
    const type = searchParams.get('type');
    if (type) {
      where.type = type;
    }

    // Filter by privacy
    const isPrivate = searchParams.get('isPrivate');
    if (isPrivate !== null) {
      where.isPrivate = isPrivate === 'true';
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Fetch feedback with counts
    const [feedback, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.feedback.count({ where }),
    ]);

    return NextResponse.json(
      {
        feedback,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching feedback:', error);
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
    const validatedData = createFeedbackSchema.parse(body);

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        ...validatedData,
        tenantId: user.tenantId,
        isPrivate: validatedData.isPrivate ?? false,
        isAnonymous: validatedData.isAnonymous ?? false,
        tags: validatedData.tags || [],
      },
    });

    return NextResponse.json(
      { feedback },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating feedback:', error);
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
    const validatedData = updateFeedbackSchema.parse(body);
    const { id, ...updateData } = validatedData;

    // Verify feedback exists and belongs to tenant
    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    });

    if (!existingFeedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    // Verify user is the provider (only provider can edit their feedback)
    if (existingFeedback.providedBy !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only edit your own feedback' },
        { status: 403 }
      );
    }

    // Update feedback
    const feedback = await prisma.feedback.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(
      { feedback },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating feedback:', error);
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
        { error: 'Feedback ID is required' },
        { status: 400 }
      );
    }

    // Verify feedback exists and belongs to tenant
    const existingFeedback = await prisma.feedback.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    });

    if (!existingFeedback) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    // Verify user is the provider (only provider can delete their feedback)
    if (existingFeedback.providedBy !== user.userId) {
      return NextResponse.json(
        { error: 'Unauthorized: You can only delete your own feedback' },
        { status: 403 }
      );
    }

    // Delete feedback
    await prisma.feedback.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Feedback deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
