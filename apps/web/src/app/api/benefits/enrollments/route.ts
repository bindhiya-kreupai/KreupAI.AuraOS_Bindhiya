import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

// ===== Validation Schemas =====
const createEnrollmentSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  employeeName: z.string().min(1, 'Employee name is required'),
  employeeCode: z.string().min(1, 'Employee code is required'),
  departmentId: z.string().optional(),
  departmentName: z.string().optional(),
  planId: z.string().min(1, 'Plan ID is required'),
  coverageLevel: z.enum(['EMPLOYEE_ONLY', 'EMPLOYEE_SPOUSE', 'EMPLOYEE_CHILDREN', 'FAMILY']),
  enrollmentType: z.enum(['NEW_HIRE', 'OPEN_ENROLLMENT', 'QUALIFYING_EVENT', 'ANNUAL_RENEWAL', 'SPECIAL_ENROLLMENT']),
  status: z.enum(['DRAFT', 'ACTIVE', 'PENDING_APPROVAL', 'APPROVED', 'CANCELLED', 'TERMINATED', 'WAIVED']).optional(),
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime().optional(),
  employeePremium: z.number().min(0),
  employerPremium: z.number().min(0),
  totalPremium: z.number().min(0),
  paymentFrequency: z.enum(['MONTHLY', 'BI_WEEKLY', 'WEEKLY', 'SEMI_MONTHLY', 'ANNUALLY']).optional(),
  enrolledDependents: z.any().optional(),
  qualifyingEventId: z.string().optional(),
  qualifyingEventType: z.enum(['MARRIAGE', 'DIVORCE', 'BIRTH', 'ADOPTION', 'DEATH', 'EMPLOYMENT_CHANGE', 'LOSS_OF_COVERAGE', 'RELOCATION', 'OTHER']).optional(),
  previousPlanId: z.string().optional(),
  notes: z.string().optional(),
});

const updateEnrollmentSchema = z.object({
  id: z.string().min(1, 'Enrollment ID is required'),
  coverageLevel: z.enum(['EMPLOYEE_ONLY', 'EMPLOYEE_SPOUSE', 'EMPLOYEE_CHILDREN', 'FAMILY']).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PENDING_APPROVAL', 'APPROVED', 'CANCELLED', 'TERMINATED', 'WAIVED']).optional(),
  effectiveTo: z.string().datetime().optional(),
  employeePremium: z.number().min(0).optional(),
  employerPremium: z.number().min(0).optional(),
  totalPremium: z.number().min(0).optional(),
  paymentFrequency: z.enum(['MONTHLY', 'BI_WEEKLY', 'WEEKLY', 'SEMI_MONTHLY', 'ANNUALLY']).optional(),
  enrolledDependents: z.any().optional(),
  approvedBy: z.string().optional(),
  cancellationReason: z.string().optional(),
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

    // Filter by plan ID
    const planId = searchParams.get('planId');
    if (planId) {
      where.planId = planId;
    }

    // Filter by status
    const status = searchParams.get('status');
    if (status) {
      where.status = status;
    }

    // Filter by enrollment type
    const enrollmentType = searchParams.get('enrollmentType');
    if (enrollmentType) {
      where.enrollmentType = enrollmentType;
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Fetch benefit enrollments
    const [enrollments, total] = await Promise.all([
      prisma.benefitEnrollment.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
        include: {
          plan: true,
          _count: {
            select: {
              claims: true,
              premiumDeductions: true,
            },
          },
        },
      }),
      prisma.benefitEnrollment.count({ where }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: enrollments,
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
    console.error('Error fetching benefit enrollments:', error);
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
    const validatedData = createEnrollmentSchema.parse(body);

    // Verify plan exists
    const plan = await prisma.benefitPlan.findFirst({
      where: {
        id: validatedData.planId,
        tenantId: user.tenantId,
        status: 'ACTIVE',
      },
    });

    if (!plan) {
      return NextResponse.json(
        { success: false, error: 'Benefit plan not found or inactive' },
        { status: 404 }
      );
    }

    // Create benefit enrollment
    const enrollment = await prisma.benefitEnrollment.create({
      data: {
        tenantId: user.tenantId,
        employeeId: validatedData.employeeId,
        employeeName: validatedData.employeeName,
        employeeCode: validatedData.employeeCode,
        departmentId: validatedData.departmentId,
        departmentName: validatedData.departmentName,
        planId: validatedData.planId,
        coverageLevel: validatedData.coverageLevel,
        enrollmentType: validatedData.enrollmentType,
        status: validatedData.status || 'DRAFT',
        effectiveFrom: new Date(validatedData.effectiveFrom),
        effectiveTo: validatedData.effectiveTo ? new Date(validatedData.effectiveTo) : null,
        employeePremium: validatedData.employeePremium,
        employerPremium: validatedData.employerPremium,
        totalPremium: validatedData.totalPremium,
        paymentFrequency: validatedData.paymentFrequency || 'MONTHLY',
        enrolledDependents: validatedData.enrolledDependents as any,
        qualifyingEventId: validatedData.qualifyingEventId,
        qualifyingEventType: validatedData.qualifyingEventType,
        previousPlanId: validatedData.previousPlanId,
        notes: validatedData.notes,
      },
      include: {
        plan: true,
      },
    });

    return NextResponse.json(
      { success: true, data: enrollment },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating benefit enrollment:', error);
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
    const validatedData = updateEnrollmentSchema.parse(body);
    const { id, ...updateData } = validatedData;

    // Verify enrollment exists and belongs to tenant
    const existingEnrollment = await prisma.benefitEnrollment.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    });

    if (!existingEnrollment) {
      return NextResponse.json(
        { success: false, error: 'Benefit enrollment not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const dataToUpdate: any = {};

    if (updateData.coverageLevel !== undefined) dataToUpdate.coverageLevel = updateData.coverageLevel;
    if (updateData.status !== undefined) {
      dataToUpdate.status = updateData.status;
      // Set dates based on status change
      if (updateData.status === 'APPROVED') {
        dataToUpdate.approvedDate = new Date();
        dataToUpdate.approvedBy = updateData.approvedBy;
      } else if (updateData.status === 'CANCELLED') {
        dataToUpdate.cancellationDate = new Date();
        dataToUpdate.cancellationReason = updateData.cancellationReason;
      }
    }
    if (updateData.effectiveTo !== undefined) dataToUpdate.effectiveTo = new Date(updateData.effectiveTo);
    if (updateData.employeePremium !== undefined) dataToUpdate.employeePremium = updateData.employeePremium;
    if (updateData.employerPremium !== undefined) dataToUpdate.employerPremium = updateData.employerPremium;
    if (updateData.totalPremium !== undefined) dataToUpdate.totalPremium = updateData.totalPremium;
    if (updateData.paymentFrequency !== undefined) dataToUpdate.paymentFrequency = updateData.paymentFrequency;
    if (updateData.enrolledDependents !== undefined) dataToUpdate.enrolledDependents = updateData.enrolledDependents as any;
    if (updateData.notes !== undefined) dataToUpdate.notes = updateData.notes;

    // Update enrollment
    const enrollment = await prisma.benefitEnrollment.update({
      where: { id },
      data: dataToUpdate,
      include: {
        plan: true,
      },
    });

    return NextResponse.json(
      { success: true, data: enrollment },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating benefit enrollment:', error);
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
        { success: false, error: 'Enrollment ID is required' },
        { status: 400 }
      );
    }

    // Verify enrollment exists and belongs to tenant
    const existingEnrollment = await prisma.benefitEnrollment.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    });

    if (!existingEnrollment) {
      return NextResponse.json(
        { success: false, error: 'Benefit enrollment not found' },
        { status: 404 }
      );
    }

    // Soft delete by marking as cancelled
    const enrollment = await prisma.benefitEnrollment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancellationDate: new Date(),
        cancellationReason: 'Deleted by user',
      },
    });

    return NextResponse.json(
      { success: true, message: 'Benefit enrollment cancelled successfully', data: enrollment },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting benefit enrollment:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});
