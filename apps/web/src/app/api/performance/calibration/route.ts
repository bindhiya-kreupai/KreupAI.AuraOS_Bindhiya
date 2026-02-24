import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

// ===== Validation Schemas =====
const adjustmentSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  originalRating: z.number().min(1).max(5),
  calibratedRating: z.number().min(1).max(5),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

const decisionsSchema = z.object({
  adjustments: z.array(adjustmentSchema),
});

const createSessionSchema = z.object({
  reviewCycleId: z.string().min(1, 'Cycle ID is required'),
  sessionName: z.string().min(1, 'Session name is required'),
  participants: z.array(z.string()).min(2, 'At least 2 participants are required'),
  scheduledDate: z.string().datetime(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
});

const updateSessionSchema = z.object({
  id: z.string().min(1, 'Session ID is required'),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
  adjustments: decisionsSchema.optional(),
  notes: z.string().optional(),
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

    // Filter by cycle
    const reviewCycleId = searchParams.get('cycleId') || searchParams.get('reviewCycleId');
    if (reviewCycleId) {
      where.reviewCycleId = reviewCycleId;
    }

    // Filter by status
    const status = searchParams.get('status');
    if (status) {
      where.status = status;
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'scheduledDate';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Fetch calibration sessions
    const [sessions, total] = await Promise.all([
      prisma.calibrationSession.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.calibrationSession.count({ where }),
    ]);

    return NextResponse.json(
      {
        sessions,
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
    console.error('Error fetching calibration sessions:', error);
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
    const validatedData = createSessionSchema.parse(body);

    // Validate scheduled date is in the future for scheduled sessions
    const scheduledDate = new Date(validatedData.scheduledDate);
    const now = new Date();

    if ((validatedData.status === 'scheduled' || !validatedData.status) && scheduledDate <= now) {
      return NextResponse.json(
        { error: 'Scheduled date must be in the future for scheduled sessions' },
        { status: 400 }
      );
    }

    // Validate cycle exists
    const cycle = await prisma.reviewCycle.findFirst({
      where: {
        id: validatedData.reviewCycleId,
        tenantId: user.tenantId,
      },
    });

    if (!cycle) {
      return NextResponse.json(
        { error: 'Review cycle not found' },
        { status: 404 }
      );
    }

    // Create calibration session
    const session = await prisma.calibrationSession.create({
      data: {
        reviewCycleId: validatedData.reviewCycleId,
        sessionName: validatedData.sessionName,
        participants: validatedData.participants,
        scheduledDate,
        status: validatedData.status || 'scheduled',
        tenantId: user.tenantId,
        createdBy: user.userId,
      },
    });

    return NextResponse.json(
      { session },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating calibration session:', error);
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
    const validatedData = updateSessionSchema.parse(body);
    const { id, ...updateData } = validatedData;

    // Verify session exists and belongs to tenant
    const existingSession = await prisma.calibrationSession.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Calibration session not found' },
        { status: 404 }
      );
    }

    // Prepare update data with proper type casting
    const dataToUpdate: any = {};

    if (updateData.status !== undefined) {
      dataToUpdate.status = updateData.status;

      // Set completedDate when status is completed
      if (updateData.status === 'completed' && existingSession.status !== 'completed') {
        dataToUpdate.completedDate = new Date();
      }
    }

    if (updateData.adjustments !== undefined) dataToUpdate.adjustments = updateData.adjustments as any;
    if (updateData.notes !== undefined) dataToUpdate.notes = updateData.notes;

    // Update calibration session
    const session = await prisma.calibrationSession.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(
      { session },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating calibration session:', error);
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
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Verify session exists and belongs to tenant
    const existingSession = await prisma.calibrationSession.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    });

    if (!existingSession) {
      return NextResponse.json(
        { error: 'Calibration session not found' },
        { status: 404 }
      );
    }

    // Only allow deletion if session is scheduled or cancelled
    if (existingSession.status === 'completed' || existingSession.status === 'in_progress') {
      return NextResponse.json(
        { error: 'Cannot delete completed or in-progress calibration sessions' },
        { status: 400 }
      );
    }

    // Delete calibration session
    await prisma.calibrationSession.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Calibration session deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting calibration session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
