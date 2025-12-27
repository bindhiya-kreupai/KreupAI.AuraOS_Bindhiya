import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

// ===== Validation Schemas =====
const agendaItemSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
});

const actionItemSchema = z.object({
  action: z.string().min(1, 'Action description is required'),
  owner: z.string().min(1, 'Owner is required'),
  dueDate: z.string().datetime(),
});

const scheduleMeetingSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  managerId: z.string().min(1, 'Manager ID is required'),
  scheduledDate: z.string().datetime(),
  duration: z.number().min(15, 'Duration must be at least 15 minutes'),
  agenda: z.array(agendaItemSchema).optional(),
});

const updateMeetingSchema = z.object({
  id: z.string().min(1, 'Meeting ID is required'),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED']).optional(),
  notes: z.string().optional(),
  actionItems: z.array(actionItemSchema).optional(),
  nextSteps: z.string().optional(),
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

    // Filter by manager
    const managerId = searchParams.get('managerId');
    if (managerId) {
      where.managerId = managerId;
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

    // Fetch meetings
    const [meetings, total] = await Promise.all([
      prisma.oneOnOneMeeting.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.oneOnOneMeeting.count({ where }),
    ]);

    return NextResponse.json(
      {
        meetings,
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
    console.error('Error fetching one-on-one meetings:', error);
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
    const validatedData = scheduleMeetingSchema.parse(body);

    // Validate scheduled date is in the future
    const scheduledDate = new Date(validatedData.scheduledDate);
    const now = new Date();

    if (scheduledDate <= now) {
      return NextResponse.json(
        { error: 'Scheduled date must be in the future' },
        { status: 400 }
      );
    }

    // Create meeting
    const meeting = await prisma.oneOnOneMeeting.create({
      data: {
        employeeId: validatedData.employeeId,
        managerId: validatedData.managerId,
        scheduledDate,
        duration: validatedData.duration,
        agenda: validatedData.agenda as any || [],
        status: 'SCHEDULED',
        tenantId: user.tenantId,
        createdBy: user.userId,
      },
    });

    return NextResponse.json(
      { meeting },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error scheduling one-on-one meeting:', error);
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
    const validatedData = updateMeetingSchema.parse(body);
    const { id, ...updateData } = validatedData;

    // Verify meeting exists and belongs to tenant
    const existingMeeting = await prisma.oneOnOneMeeting.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    });

    if (!existingMeeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Prepare update data with proper type casting
    const dataToUpdate: any = {};

    if (updateData.status !== undefined) {
      dataToUpdate.status = updateData.status;

      // Set completedAt when status is COMPLETED
      if (updateData.status === 'COMPLETED' && existingMeeting.status !== 'COMPLETED') {
        dataToUpdate.completedAt = new Date();
      }
    }

    if (updateData.notes !== undefined) dataToUpdate.notes = updateData.notes;
    if (updateData.actionItems !== undefined) dataToUpdate.actionItems = updateData.actionItems as any;
    if (updateData.nextSteps !== undefined) dataToUpdate.nextSteps = updateData.nextSteps;

    // Update meeting
    const meeting = await prisma.oneOnOneMeeting.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(
      { meeting },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating one-on-one meeting:', error);
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
        { error: 'Meeting ID is required' },
        { status: 400 }
      );
    }

    // Verify meeting exists and belongs to tenant
    const existingMeeting = await prisma.oneOnOneMeeting.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    });

    if (!existingMeeting) {
      return NextResponse.json(
        { error: 'Meeting not found' },
        { status: 404 }
      );
    }

    // Cancel instead of delete if meeting is scheduled
    if (existingMeeting.status === 'SCHEDULED') {
      const meeting = await prisma.oneOnOneMeeting.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      return NextResponse.json(
        { message: 'Meeting cancelled successfully', meeting },
        { status: 200 }
      );
    }

    // Delete meeting if not scheduled
    await prisma.oneOnOneMeeting.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Meeting deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting one-on-one meeting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
