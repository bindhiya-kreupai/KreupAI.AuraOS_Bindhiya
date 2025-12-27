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
  cycleId: z.string().min(1, 'Cycle ID is required'),
  name: z.string().min(1, 'Session name is required'),
  participants: z.array(z.string()).min(2, 'At least 2 participants are required'),
  meetingDate: z.string().datetime(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
});

const updateSessionSchema = z.object({
  id: z.string().min(1, 'Session ID is required'),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  decisions: decisionsSchema.optional(),
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
    const cycleId = searchParams.get('cycleId');
    if (cycleId) {
      where.cycleId = cycleId;
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
    const sortBy = searchParams.get('sortBy') || 'meetingDate';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Fetch calibration sessions
    const [sessions, total] = await Promise.all([
      prisma.calibration.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.calibration.count({ where }),
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

    // Validate meeting date is in the future for scheduled sessions
    const meetingDate = new Date(validatedData.meetingDate);
    const now = new Date();

    if ((validatedData.status === 'SCHEDULED' || !validatedData.status) && meetingDate <= now) {
      return NextResponse.json(
        { error: 'Meeting date must be in the future for scheduled sessions' },
        { status: 400 }
      );
    }

    // Validate cycle exists
    const cycle = await prisma.performanceReviewCycle.findFirst({
      where: {
        id: validatedData.cycleId,
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
    const session = await prisma.calibration.create({
      data: {
        cycleId: validatedData.cycleId,
        name: validatedData.name,
        participants: validatedData.participants,
        meetingDate,
        status: validatedData.status || 'SCHEDULED',
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
    const existingSession = await prisma.calibration.findFirst({
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

      // Set completedAt when status is COMPLETED
      if (updateData.status === 'COMPLETED' && existingSession.status !== 'COMPLETED') {
        dataToUpdate.completedAt = new Date();
      }
    }

    if (updateData.decisions !== undefined) dataToUpdate.decisions = updateData.decisions as any;
    if (updateData.notes !== undefined) dataToUpdate.notes = updateData.notes;

    // Update calibration session
    const session = await prisma.calibration.update({
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
    const existingSession = await prisma.calibration.findFirst({
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

    // Only allow deletion if session is SCHEDULED or CANCELLED
    if (existingSession.status === 'COMPLETED' || existingSession.status === 'IN_PROGRESS') {
      return NextResponse.json(
        { error: 'Cannot delete completed or in-progress calibration sessions' },
        { status: 400 }
      );
    }

    // Delete calibration session
    await prisma.calibration.delete({
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
