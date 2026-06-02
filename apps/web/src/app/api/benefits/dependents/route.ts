import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

// ===== Validation Schemas =====
const createDependentSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().datetime(),
  relationship: z.enum(['SPOUSE', 'DOMESTIC_PARTNER', 'CHILD', 'STEPCHILD', 'ADOPTED_CHILD', 'FOSTER_CHILD', 'PARENT', 'OTHER']),
  gender: z.string().optional(),
  ssn: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.any().optional(),
  isStudent: z.boolean().default(false),
  isDisabled: z.boolean().default(false),
  status: z.enum(['ACTIVE', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'INACTIVE', 'AGED_OUT']).optional(),
  verificationDocuments: z.any().optional(),
  notes: z.string().optional(),
});

const updateDependentSchema = z.object({
  id: z.string().min(1, 'Dependent ID is required'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(),
  relationship: z.enum(['SPOUSE', 'DOMESTIC_PARTNER', 'CHILD', 'STEPCHILD', 'ADOPTED_CHILD', 'FOSTER_CHILD', 'PARENT', 'OTHER']).optional(),
  gender: z.string().optional(),
  ssn: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.any().optional(),
  isStudent: z.boolean().optional(),
  isDisabled: z.boolean().optional(),
  status: z.enum(['ACTIVE', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'INACTIVE', 'AGED_OUT']).optional(),
  verificationDocuments: z.any().optional(),
  verifiedBy: z.string().optional(),
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

    // Filter by employee ID
    const employeeId = searchParams.get('employeeId');
    if (employeeId) {
      where.employeeId = employeeId;
    }

    // Filter by relationship
    const relationship = searchParams.get('relationship');
    if (relationship) {
      where.relationship = relationship;
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
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Fetch dependents
    const [dependents, total] = await Promise.all([
      prisma.dependent.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.dependent.count({ where }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: dependents,
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
    console.error('Error fetching dependents:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
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
    const validatedData = createDependentSchema.parse(body);

    // Create dependent
    const dependent = await prisma.dependent.create({
      data: {
        tenantId: user.tenantId,
        employeeId: validatedData.employeeId,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        dateOfBirth: new Date(validatedData.dateOfBirth),
        relationship: validatedData.relationship,
        gender: validatedData.gender,
        ssn: validatedData.ssn,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address as any,
        isStudent: validatedData.isStudent,
        isDisabled: validatedData.isDisabled,
        status: validatedData.status || 'PENDING_VERIFICATION',
        verificationDocuments: validatedData.verificationDocuments as any,
        notes: validatedData.notes,
      },
    });

    return NextResponse.json(
      { success: true, data: dependent },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating dependent:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
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
    const validatedData = updateDependentSchema.parse(body);
    const { id, ...updateData } = validatedData;

    // Verify dependent exists and belongs to tenant
    const existingDependent = await prisma.dependent.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    });

    if (!existingDependent) {
      return NextResponse.json(
        { success: false, error: 'Dependent not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const dataToUpdate: any = {};

    if (updateData.firstName !== undefined) dataToUpdate.firstName = updateData.firstName;
    if (updateData.lastName !== undefined) dataToUpdate.lastName = updateData.lastName;
    if (updateData.dateOfBirth !== undefined) dataToUpdate.dateOfBirth = new Date(updateData.dateOfBirth);
    if (updateData.relationship !== undefined) dataToUpdate.relationship = updateData.relationship;
    if (updateData.gender !== undefined) dataToUpdate.gender = updateData.gender;
    if (updateData.ssn !== undefined) dataToUpdate.ssn = updateData.ssn;
    if (updateData.email !== undefined) dataToUpdate.email = updateData.email;
    if (updateData.phone !== undefined) dataToUpdate.phone = updateData.phone;
    if (updateData.address !== undefined) dataToUpdate.address = updateData.address as any;
    if (updateData.isStudent !== undefined) dataToUpdate.isStudent = updateData.isStudent;
    if (updateData.isDisabled !== undefined) dataToUpdate.isDisabled = updateData.isDisabled;
    if (updateData.status !== undefined) {
      dataToUpdate.status = updateData.status;
      // Set verification fields if status is VERIFIED
      if (updateData.status === 'VERIFIED') {
        dataToUpdate.verifiedDate = new Date();
        dataToUpdate.verifiedBy = updateData.verifiedBy;
      }
    }
    if (updateData.verificationDocuments !== undefined) dataToUpdate.verificationDocuments = updateData.verificationDocuments as any;
    if (updateData.notes !== undefined) dataToUpdate.notes = updateData.notes;

    // Update dependent
    const dependent = await prisma.dependent.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(
      { success: true, data: dependent },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating dependent:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
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
        { success: false, error: 'Dependent ID is required' },
        { status: 400 }
      );
    }

    // Verify dependent exists and belongs to tenant
    const existingDependent = await prisma.dependent.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    });

    if (!existingDependent) {
      return NextResponse.json(
        { success: false, error: 'Dependent not found' },
        { status: 404 }
      );
    }

    // Soft delete by marking as inactive
    const dependent = await prisma.dependent.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });

    return NextResponse.json(
      { success: true, message: 'Dependent deactivated successfully', data: dependent },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting dependent:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});
