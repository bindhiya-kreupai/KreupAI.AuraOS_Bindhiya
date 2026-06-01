import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { z } from 'zod';
import { randomUUID } from 'crypto';

// Validation schema for mass update configuration
const MassUpdateSchema = z.object({
  name: z.string().min(1, 'Update name is required'),
  description: z.string().optional(),
  targetEntity: z.string().min(1, 'Target entity is required'),
  updateType: z.string().min(1, 'Update type is required'),
  filters: z.record(z.any()).optional(),
  changes: z.record(z.any()).optional(),
  employeeIds: z.array(z.string()).optional(),
  effectiveDate: z.string().datetime().optional(),
  scheduledAt: z.string().datetime().optional(),
});

export const GET = withEnhancedAuth(async (request, context) => {
  try {
    // No specific Prisma model for mass updates
    // Return empty array as placeholder
    return NextResponse.json({ updates: [] }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching mass updates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mass updates' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    const validated = MassUpdateSchema.parse(body);

    // Return the configuration with generated id and PENDING status
    const update = {
      id: randomUUID(),
      ...validated,
      tenantId: user.tenantId,
      status: 'PENDING',
      totalRecords: validated.employeeIds?.length ?? 0,
      processedRecords: 0,
      failedRecords: 0,
      createdAt: new Date().toISOString(),
      createdBy: user.userId,
    };

    return NextResponse.json({ update }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating mass update:', error);
    return NextResponse.json(
      { error: 'Failed to create mass update' },
      { status: 500 }
    );
  }
});

export const PUT = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: 'Update ID is required' },
        { status: 400 }
      );
    }

    const update = {
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: user.userId,
    };

    return NextResponse.json({ update }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating mass update:', error);
    return NextResponse.json(
      { error: 'Failed to update mass update' },
      { status: 500 }
    );
  }
});
