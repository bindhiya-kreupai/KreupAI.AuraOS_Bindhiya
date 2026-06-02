import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

// ===== Validation Schemas =====
const createClaimSchema = z.object({
  enrollmentId: z.string().min(1, 'Enrollment ID is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  employeeName: z.string().min(1, 'Employee name is required'),
  planId: z.string().optional(),
  planName: z.string().optional(),
  claimType: z.enum(['HEALTH_INSURANCE', 'DENTAL', 'VISION', 'LIFE_INSURANCE', 'DISABILITY', 'RETIREMENT', 'FSA_HSA', 'WELLNESS', 'EDUCATION', 'TRANSPORTATION', 'OTHER']),
  claimDate: z.string().datetime(),
  serviceDate: z.string().datetime(),
  providerId: z.string().optional(),
  providerName: z.string().optional(),
  claimAmount: z.number().positive('Claim amount must be positive'),
  documents: z.any().optional(),
  diagnosisCodes: z.any().optional(),
  procedureCodes: z.any().optional(),
  notes: z.string().optional(),
});

const updateClaimSchema = z.object({
  id: z.string().min(1, 'Claim ID is required'),
  status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'PAID', 'PENDING_INFO']).optional(),
  approvedAmount: z.number().min(0).optional(),
  paidAmount: z.number().min(0).optional(),
  employeeResponsibility: z.number().min(0).optional(),
  deductibleApplied: z.number().min(0).optional(),
  coinsuranceApplied: z.number().min(0).optional(),
  copayApplied: z.number().min(0).optional(),
  reviewedBy: z.string().optional(),
  approvedBy: z.string().optional(),
  paymentMethod: z.string().optional(),
  checkNumber: z.string().optional(),
  rejectionReason: z.string().optional(),
  documents: z.any().optional(),
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

    // Filter by enrollment ID
    const enrollmentId = searchParams.get('enrollmentId');
    if (enrollmentId) {
      where.enrollmentId = enrollmentId;
    }

    // Filter by claim type
    const claimType = searchParams.get('claimType');
    if (claimType) {
      where.claimType = claimType;
    }

    // Filter by status
    const status = searchParams.get('status');
    if (status) {
      where.status = status;
    }

    // Date range filters
    const claimDateFrom = searchParams.get('claimDateFrom');
    const claimDateTo = searchParams.get('claimDateTo');
    if (claimDateFrom || claimDateTo) {
      where.claimDate = {};
      if (claimDateFrom) where.claimDate.gte = new Date(claimDateFrom);
      if (claimDateTo) where.claimDate.lte = new Date(claimDateTo);
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'claimDate';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Fetch claims
    const [claims, total] = await Promise.all([
      prisma.benefitClaim.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
        include: {
          enrollment: {
            include: {
              plan: true,
            },
          },
        },
      }),
      prisma.benefitClaim.count({ where }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: claims,
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
    console.error('Error fetching benefit claims:', error);
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
    const validatedData = createClaimSchema.parse(body);

    // Verify enrollment exists
    const enrollment = await prisma.benefitEnrollment.findFirst({
      where: {
        id: validatedData.enrollmentId,
        tenantId: user.tenantId,
        status: 'ACTIVE',
      },
      include: {
        plan: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'Active enrollment not found' },
        { status: 404 }
      );
    }

    // Generate claim number
    const claimCount = await prisma.benefitClaim.count({
      where: { tenantId: user.tenantId },
    });
    const claimNumber = `CLM-${new Date().getFullYear()}-${String(claimCount + 1).padStart(6, '0')}`;

    // Create benefit claim
    const claim = await prisma.benefitClaim.create({
      data: {
        tenantId: user.tenantId,
        claimNumber,
        enrollmentId: validatedData.enrollmentId,
        employeeId: validatedData.employeeId,
        employeeName: validatedData.employeeName,
        planId: enrollment.planId,
        planName: enrollment.plan.planName,
        claimType: validatedData.claimType,
        claimDate: new Date(validatedData.claimDate),
        serviceDate: new Date(validatedData.serviceDate),
        providerId: validatedData.providerId,
        providerName: validatedData.providerName,
        claimAmount: validatedData.claimAmount,
        status: 'SUBMITTED',
        documents: validatedData.documents as any,
        diagnosisCodes: validatedData.diagnosisCodes as any,
        procedureCodes: validatedData.procedureCodes as any,
        notes: validatedData.notes,
      },
      include: {
        enrollment: {
          include: {
            plan: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: claim },
      { status: 201 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating benefit claim:', error);
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
    const validatedData = updateClaimSchema.parse(body);
    const { id, ...updateData } = validatedData;

    // Verify claim exists and belongs to tenant
    const existingClaim = await prisma.benefitClaim.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    });

    if (!existingClaim) {
      return NextResponse.json(
        { success: false, error: 'Benefit claim not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const dataToUpdate: any = {};

    if (updateData.status !== undefined) {
      dataToUpdate.status = updateData.status;
      // Set dates based on status change
      if (updateData.status === 'UNDER_REVIEW') {
        dataToUpdate.reviewedDate = new Date();
        dataToUpdate.reviewedBy = updateData.reviewedBy;
      } else if (updateData.status === 'APPROVED' || updateData.status === 'PARTIALLY_APPROVED') {
        dataToUpdate.approvedDate = new Date();
        dataToUpdate.approvedBy = updateData.approvedBy;
      } else if (updateData.status === 'PAID') {
        dataToUpdate.paidDate = new Date();
      }
    }
    if (updateData.approvedAmount !== undefined) dataToUpdate.approvedAmount = updateData.approvedAmount;
    if (updateData.paidAmount !== undefined) dataToUpdate.paidAmount = updateData.paidAmount;
    if (updateData.employeeResponsibility !== undefined) dataToUpdate.employeeResponsibility = updateData.employeeResponsibility;
    if (updateData.deductibleApplied !== undefined) dataToUpdate.deductibleApplied = updateData.deductibleApplied;
    if (updateData.coinsuranceApplied !== undefined) dataToUpdate.coinsuranceApplied = updateData.coinsuranceApplied;
    if (updateData.copayApplied !== undefined) dataToUpdate.copayApplied = updateData.copayApplied;
    if (updateData.paymentMethod !== undefined) dataToUpdate.paymentMethod = updateData.paymentMethod;
    if (updateData.checkNumber !== undefined) dataToUpdate.checkNumber = updateData.checkNumber;
    if (updateData.rejectionReason !== undefined) dataToUpdate.rejectionReason = updateData.rejectionReason;
    if (updateData.documents !== undefined) dataToUpdate.documents = updateData.documents as any;
    if (updateData.notes !== undefined) dataToUpdate.notes = updateData.notes;

    // Update claim
    const claim = await prisma.benefitClaim.update({
      where: { id },
      data: dataToUpdate,
      include: {
        enrollment: {
          include: {
            plan: true,
          },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: claim },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating benefit claim:', error);
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
        { success: false, error: 'Claim ID is required' },
        { status: 400 }
      );
    }

    // Verify claim exists and belongs to tenant
    const existingClaim = await prisma.benefitClaim.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    });

    if (!existingClaim) {
      return NextResponse.json(
        { success: false, error: 'Benefit claim not found' },
        { status: 404 }
      );
    }

    // Only allow deletion of submitted claims
    if (existingClaim.status !== 'SUBMITTED') {
      return NextResponse.json(
        { success: false, error: 'Only submitted claims can be deleted' },
        { status: 400 }
      );
    }

    // Hard delete for submitted claims
    await prisma.benefitClaim.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: 'Benefit claim deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting benefit claim:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});
