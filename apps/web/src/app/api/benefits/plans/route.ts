import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

// ===== Validation Schemas =====
const createPlanSchema = z.object({
  planCode: z.string().min(1, 'Plan code is required'),
  planName: z.string().min(1, 'Plan name is required'),
  category: z.enum(['HEALTH_INSURANCE', 'DENTAL', 'VISION', 'LIFE_INSURANCE', 'DISABILITY', 'RETIREMENT', 'FSA_HSA', 'WELLNESS', 'EDUCATION', 'TRANSPORTATION', 'OTHER']),
  planTier: z.enum(['BASIC', 'STANDARD', 'PREMIUM', 'EXECUTIVE']).optional(),
  carrierName: z.string().min(1, 'Carrier name is required'),
  carrierPolicyNumber: z.string().optional(),
  description: z.string().optional(),
  coverage: z.any().optional(),
  exclusions: z.any().optional(),
  eligibilityCriteria: z.any().optional(),
  employeePremium: z.number().min(0).default(0),
  employerPremium: z.number().min(0).default(0),
  spousePremium: z.number().min(0).optional(),
  childPremium: z.number().min(0).optional(),
  familyPremium: z.number().min(0).optional(),
  deductible: z.number().min(0).optional(),
  outOfPocketMax: z.number().min(0).optional(),
  copay: z.number().min(0).optional(),
  coinsurance: z.number().min(0).optional(),
  networkInfo: z.any().optional(),
  documentUrls: z.any().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'ARCHIVED']).optional(),
  effectiveFrom: z.string().datetime(),
  effectiveTo: z.string().datetime().optional(),
  waitingPeriodDays: z.number().int().min(0).default(0),
  isEmployeeContribution: z.boolean().default(true),
  maxAge: z.number().int().positive().optional(),
  displayOrder: z.number().int().min(0).default(0),
});

const updatePlanSchema = z.object({
  id: z.string().min(1, 'Plan ID is required'),
  planName: z.string().optional(),
  category: z.enum(['HEALTH_INSURANCE', 'DENTAL', 'VISION', 'LIFE_INSURANCE', 'DISABILITY', 'RETIREMENT', 'FSA_HSA', 'WELLNESS', 'EDUCATION', 'TRANSPORTATION', 'OTHER']).optional(),
  planTier: z.enum(['BASIC', 'STANDARD', 'PREMIUM', 'EXECUTIVE']).optional(),
  carrierName: z.string().optional(),
  carrierPolicyNumber: z.string().optional(),
  description: z.string().optional(),
  coverage: z.any().optional(),
  exclusions: z.any().optional(),
  eligibilityCriteria: z.any().optional(),
  employeePremium: z.number().min(0).optional(),
  employerPremium: z.number().min(0).optional(),
  spousePremium: z.number().min(0).optional(),
  childPremium: z.number().min(0).optional(),
  familyPremium: z.number().min(0).optional(),
  deductible: z.number().min(0).optional(),
  outOfPocketMax: z.number().min(0).optional(),
  copay: z.number().min(0).optional(),
  coinsurance: z.number().min(0).optional(),
  networkInfo: z.any().optional(),
  documentUrls: z.any().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'SUSPENDED', 'TERMINATED', 'ARCHIVED']).optional(),
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional(),
  waitingPeriodDays: z.number().int().min(0).optional(),
  isEmployeeContribution: z.boolean().optional(),
  maxAge: z.number().int().positive().optional(),
  displayOrder: z.number().int().min(0).optional(),
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

    // Filter by category
    const category = searchParams.get('category');
    if (category) {
      where.category = category;
    }

    // Filter by status
    const status = searchParams.get('status');
    if (status) {
      where.status = status;
    }

    // Filter by plan tier
    const planTier = searchParams.get('planTier');
    if (planTier) {
      where.planTier = planTier;
    }

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Sorting
    const sortBy = searchParams.get('sortBy') || 'displayOrder';
    const sortOrder = (searchParams.get('sortOrder') || 'asc') as 'asc' | 'desc';

    // Fetch benefit plans
    const [plans, total] = await Promise.all([
      prisma.benefitPlan.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              enrollments: true,
              premiumRates: true,
            },
          },
        },
      }),
      prisma.benefitPlan.count({ where }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: plans,
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
    console.error('Error fetching benefit plans:', error);
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
    const validatedData = createPlanSchema.parse(body);

    // Check if plan code already exists
    const existing = await prisma.benefitPlan.findFirst({
      where: {
        tenantId: user.tenantId,
        planCode: validatedData.planCode,
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Plan code already exists' },
        { status: 400 }
      );
    }

    // Create benefit plan
    const plan = await prisma.benefitPlan.create({
      data: {
        tenantId: user.tenantId,
        planCode: validatedData.planCode,
        planName: validatedData.planName,
        category: validatedData.category,
        planTier: validatedData.planTier,
        carrierName: validatedData.carrierName,
        carrierPolicyNumber: validatedData.carrierPolicyNumber,
        description: validatedData.description,
        coverage: validatedData.coverage as any,
        exclusions: validatedData.exclusions as any,
        eligibilityCriteria: validatedData.eligibilityCriteria as any,
        employeePremium: validatedData.employeePremium,
        employerPremium: validatedData.employerPremium,
        spousePremium: validatedData.spousePremium,
        childPremium: validatedData.childPremium,
        familyPremium: validatedData.familyPremium,
        deductible: validatedData.deductible,
        outOfPocketMax: validatedData.outOfPocketMax,
        copay: validatedData.copay,
        coinsurance: validatedData.coinsurance,
        networkInfo: validatedData.networkInfo as any,
        documentUrls: validatedData.documentUrls as any,
        status: validatedData.status || 'DRAFT',
        effectiveFrom: new Date(validatedData.effectiveFrom),
        effectiveTo: validatedData.effectiveTo ? new Date(validatedData.effectiveTo) : null,
        waitingPeriodDays: validatedData.waitingPeriodDays,
        isEmployeeContribution: validatedData.isEmployeeContribution,
        maxAge: validatedData.maxAge,
        displayOrder: validatedData.displayOrder,
      },
    });

    return NextResponse.json(
      { success: true, data: plan },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating benefit plan:', error);
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
    const validatedData = updatePlanSchema.parse(body);
    const { id, ...updateData } = validatedData;

    // Verify plan exists and belongs to tenant
    const existingPlan = await prisma.benefitPlan.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { success: false, error: 'Benefit plan not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const dataToUpdate: any = {};

    if (updateData.planName !== undefined) dataToUpdate.planName = updateData.planName;
    if (updateData.category !== undefined) dataToUpdate.category = updateData.category;
    if (updateData.planTier !== undefined) dataToUpdate.planTier = updateData.planTier;
    if (updateData.carrierName !== undefined) dataToUpdate.carrierName = updateData.carrierName;
    if (updateData.carrierPolicyNumber !== undefined) dataToUpdate.carrierPolicyNumber = updateData.carrierPolicyNumber;
    if (updateData.description !== undefined) dataToUpdate.description = updateData.description;
    if (updateData.coverage !== undefined) dataToUpdate.coverage = updateData.coverage as any;
    if (updateData.exclusions !== undefined) dataToUpdate.exclusions = updateData.exclusions as any;
    if (updateData.eligibilityCriteria !== undefined) dataToUpdate.eligibilityCriteria = updateData.eligibilityCriteria as any;
    if (updateData.employeePremium !== undefined) dataToUpdate.employeePremium = updateData.employeePremium;
    if (updateData.employerPremium !== undefined) dataToUpdate.employerPremium = updateData.employerPremium;
    if (updateData.spousePremium !== undefined) dataToUpdate.spousePremium = updateData.spousePremium;
    if (updateData.childPremium !== undefined) dataToUpdate.childPremium = updateData.childPremium;
    if (updateData.familyPremium !== undefined) dataToUpdate.familyPremium = updateData.familyPremium;
    if (updateData.deductible !== undefined) dataToUpdate.deductible = updateData.deductible;
    if (updateData.outOfPocketMax !== undefined) dataToUpdate.outOfPocketMax = updateData.outOfPocketMax;
    if (updateData.copay !== undefined) dataToUpdate.copay = updateData.copay;
    if (updateData.coinsurance !== undefined) dataToUpdate.coinsurance = updateData.coinsurance;
    if (updateData.networkInfo !== undefined) dataToUpdate.networkInfo = updateData.networkInfo as any;
    if (updateData.documentUrls !== undefined) dataToUpdate.documentUrls = updateData.documentUrls as any;
    if (updateData.status !== undefined) dataToUpdate.status = updateData.status;
    if (updateData.effectiveFrom !== undefined) dataToUpdate.effectiveFrom = new Date(updateData.effectiveFrom);
    if (updateData.effectiveTo !== undefined) dataToUpdate.effectiveTo = new Date(updateData.effectiveTo);
    if (updateData.waitingPeriodDays !== undefined) dataToUpdate.waitingPeriodDays = updateData.waitingPeriodDays;
    if (updateData.isEmployeeContribution !== undefined) dataToUpdate.isEmployeeContribution = updateData.isEmployeeContribution;
    if (updateData.maxAge !== undefined) dataToUpdate.maxAge = updateData.maxAge;
    if (updateData.displayOrder !== undefined) dataToUpdate.displayOrder = updateData.displayOrder;

    // Update plan
    const plan = await prisma.benefitPlan.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(
      { success: true, data: plan },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating benefit plan:', error);
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
        { success: false, error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Verify plan exists and belongs to tenant
    const existingPlan = await prisma.benefitPlan.findFirst({
      where: {
        id,
        tenantId: user.tenantId,
      },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { success: false, error: 'Benefit plan not found' },
        { status: 404 }
      );
    }

    // Soft delete by marking as archived
    const plan = await prisma.benefitPlan.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    return NextResponse.json(
      { success: true, message: 'Benefit plan archived successfully', data: plan },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting benefit plan:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
});
