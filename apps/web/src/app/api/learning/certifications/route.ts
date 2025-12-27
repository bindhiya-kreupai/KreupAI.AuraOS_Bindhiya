import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

// ===== Validation Schemas =====
const createCertificationSchema = z.object({
  certificateNumber: z.string().min(1, 'Certificate number is required'),
  certificateName: z.string().min(1, 'Certificate name is required'),
  learnerId: z.string().min(1, 'Learner ID is required'),
  learnerName: z.string().min(1, 'Learner name is required'),
  learnerEmail: z.string().email('Invalid email'),
  courseId: z.string().optional(),
  courseName: z.string().optional(),
  issuedDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
  status: z.enum(['ACTIVE', 'EXPIRED', 'REVOKED', 'PENDING_RENEWAL']).optional(),
  issuedBy: z.string().min(1, 'Issued by is required'),
  verificationUrl: z.string().url().optional().or(z.literal('')),
  certificateUrl: z.string().url().optional().or(z.literal('')),
  metadata: z.any().optional(),
});

const updateCertificationSchema = z.object({
  id: z.string().min(1, 'Certification ID is required'),
  status: z.enum(['ACTIVE', 'EXPIRED', 'REVOKED', 'PENDING_RENEWAL']).optional(),
  expiryDate: z.string().datetime().optional(),
  certificateUrl: z.string().url().optional().or(z.literal('')),
  metadata: z.any().optional(),
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

    // Filter by learner
    const learnerId = searchParams.get('learnerId');
    if (learnerId) {
      where.learnerId = learnerId;
    }

    // Filter by status
    const status = searchParams.get('status');
    if (status) {
      where.status = status;
    }

    // Filter by course
    const courseId = searchParams.get('courseId');
    if (courseId) {
      where.courseId = courseId;
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'issuedDate';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Fetch certifications
    const [certifications, total] = await Promise.all([
      prisma.certification.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.certification.count({ where }),
    ]);

    return NextResponse.json(
      {
        certifications,
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
    console.error('Error fetching certifications:', error);
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
    const validatedData = createCertificationSchema.parse(body);

    // Check if certificate number already exists
    const existing = await prisma.certification.findFirst({
      where: {
        tenantId: user.tenantId,
        certificateNumber: validatedData.certificateNumber,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Certificate number already exists' },
        { status: 400 }
      );
    }

    // Create certification
    const certification = await prisma.certification.create({
      data: {
        tenantId: user.tenantId,
        certificateNumber: validatedData.certificateNumber,
        certificateName: validatedData.certificateName,
        learnerId: validatedData.learnerId,
        learnerName: validatedData.learnerName,
        learnerEmail: validatedData.learnerEmail,
        courseId: validatedData.courseId,
        courseName: validatedData.courseName,
        issuedDate: validatedData.issuedDate ? new Date(validatedData.issuedDate) : new Date(),
        expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : undefined,
        status: validatedData.status || 'ACTIVE',
        issuedBy: validatedData.issuedBy,
        verificationUrl: validatedData.verificationUrl,
        certificateUrl: validatedData.certificateUrl,
        metadata: validatedData.metadata as any,
      },
    });

    return NextResponse.json(
      { certification },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating certification:', error);
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
    const validatedData = updateCertificationSchema.parse(body);
    const { id, ...updateData } = validatedData;

    // Verify certification exists and belongs to tenant
    const existingCertification = await prisma.certification.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    });

    if (!existingCertification) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const dataToUpdate: any = {};

    if (updateData.status !== undefined) dataToUpdate.status = updateData.status;
    if (updateData.expiryDate !== undefined) dataToUpdate.expiryDate = new Date(updateData.expiryDate);
    if (updateData.certificateUrl !== undefined) dataToUpdate.certificateUrl = updateData.certificateUrl;
    if (updateData.metadata !== undefined) dataToUpdate.metadata = updateData.metadata as any;

    // Update certification
    const certification = await prisma.certification.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(
      { certification },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating certification:', error);
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
        { error: 'Certification ID is required' },
        { status: 400 }
      );
    }

    // Verify certification exists and belongs to tenant
    const existingCertification = await prisma.certification.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    });

    if (!existingCertification) {
      return NextResponse.json(
        { error: 'Certification not found' },
        { status: 404 }
      );
    }

    // Revoke instead of delete for active certifications
    if (existingCertification.status === 'ACTIVE') {
      const certification = await prisma.certification.update({
        where: { id },
        data: { status: 'REVOKED' },
      });

      return NextResponse.json(
        { message: 'Certification revoked successfully', certification },
        { status: 200 }
      );
    }

    // Delete certification
    await prisma.certification.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Certification deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting certification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
