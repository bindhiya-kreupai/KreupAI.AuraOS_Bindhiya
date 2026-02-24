import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

// Validation schemas
const createLeavePolicySchema = z.object({
  companyId: z.string().uuid().optional().nullable(),
  countryCode: z.string().optional().nullable(),
  code: z.string().min(1),
  name: z.string().min(1),
  nameAr: z.string().optional().nullable(),
  leaveTypeId: z.string().uuid(),
  employmentTypes: z.array(z.string()).optional().nullable(),
  minServiceMonths: z.number().int().min(0).default(0),
  annualEntitlement: z.number().min(0),
  accrualType: z.enum(['ANNUAL', 'MONTHLY', 'QUARTERLY', 'TENURE']).default('MONTHLY'),
  accrualRate: z.number().optional().nullable(),
  allowCarryForward: z.boolean().default(true),
  maxCarryForwardDays: z.number().optional().nullable(),
  carryForwardExpiryMonths: z.number().int().optional().nullable(),
  allowEncashment: z.boolean().default(false),
  maxEncashmentDays: z.number().optional().nullable(),
  encashmentRate: z.number().min(0).max(200).default(100),
});

/**
 * GET /api/v1/leave/policies
 * List leave policies with filtering and pagination
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const companyId = searchParams.get('companyId');
    const countryCode = searchParams.get('countryCode');
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(Math.max(1, parseInt(searchParams.get('limit') || '20')), 100);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, any> = {
      tenantId: user.tenantId,
    };

    if (companyId) {
      where.companyId = companyId;
    }

    if (countryCode) {
      where.countryCode = countryCode;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { nameAr: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Query policies with pagination
    const [policies, total] = await Promise.all([
      prisma.leavePolicy.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        select: {
          id: true,
          code: true,
          name: true,
          nameAr: true,
          leaveTypeId: true,
          companyId: true,
          countryCode: true,
          employmentTypes: true,
          minServiceMonths: true,
          annualEntitlement: true,
          accrualType: true,
          accrualRate: true,
          allowCarryForward: true,
          maxCarryForwardDays: true,
          carryForwardExpiryMonths: true,
          allowEncashment: true,
          maxEncashmentDays: true,
          encashmentRate: true,
          isActive: true,
          effectiveFrom: true,
          effectiveTo: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.leavePolicy.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Format the response to maintain existing shape
    const formattedPolicies = policies.map(p => ({
      ...p,
      annualEntitlement: Number(p.annualEntitlement),
      accrualRate: p.accrualRate ? Number(p.accrualRate) : null,
      maxCarryForwardDays: p.maxCarryForwardDays ? Number(p.maxCarryForwardDays) : null,
      maxEncashmentDays: p.maxEncashmentDays ? Number(p.maxEncashmentDays) : null,
      encashmentRate: Number(p.encashmentRate),
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      effectiveFrom: p.effectiveFrom.toISOString(),
      effectiveTo: p.effectiveTo?.toISOString() ?? null,
    }));

    return NextResponse.json({
      success: true,
      data: formattedPolicies,
      meta: {
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    }, { status: 200 });
  } catch (error) {
    console.error('[Leave Policies API] GET Error:', error);

    return NextResponse.json({
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to fetch leave policies',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    }, { status: 500 });
  }
});

/**
 * POST /api/v1/leave/policies
 * Create a new leave policy
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json();

    // Validate request body
    const validationResult = createLeavePolicySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'E2001',
          message: 'Validation failed',
          details: { errors: validationResult.error.errors },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      }, { status: 400 });
    }

    const data = validationResult.data;

    // Check for duplicate code within tenant
    const existing = await prisma.leavePolicy.findUnique({
      where: {
        tenantId_code: {
          tenantId: user.tenantId,
          code: data.code,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        success: false,
        error: {
          code: 'E4004',
          message: `A leave policy with code '${data.code}' already exists`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      }, { status: 409 });
    }

    // Create the leave policy
    const policy = await prisma.leavePolicy.create({
      data: {
        tenantId: user.tenantId,
        companyId: data.companyId ?? undefined,
        countryCode: data.countryCode ?? undefined,
        code: data.code,
        name: data.name,
        nameAr: data.nameAr ?? undefined,
        leaveTypeId: data.leaveTypeId,
        employmentTypes: data.employmentTypes ?? undefined,
        minServiceMonths: data.minServiceMonths,
        annualEntitlement: data.annualEntitlement,
        accrualType: data.accrualType,
        accrualRate: data.accrualRate ?? undefined,
        allowCarryForward: data.allowCarryForward,
        maxCarryForwardDays: data.maxCarryForwardDays ?? undefined,
        carryForwardExpiryMonths: data.carryForwardExpiryMonths ?? undefined,
        allowEncashment: data.allowEncashment,
        maxEncashmentDays: data.maxEncashmentDays ?? undefined,
        encashmentRate: data.encashmentRate,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...policy,
        annualEntitlement: Number(policy.annualEntitlement),
        accrualRate: policy.accrualRate ? Number(policy.accrualRate) : null,
        maxCarryForwardDays: policy.maxCarryForwardDays ? Number(policy.maxCarryForwardDays) : null,
        maxEncashmentDays: policy.maxEncashmentDays ? Number(policy.maxEncashmentDays) : null,
        maxNegativeDays: policy.maxNegativeDays ? Number(policy.maxNegativeDays) : null,
        encashmentRate: Number(policy.encashmentRate),
        createdAt: policy.createdAt.toISOString(),
        updatedAt: policy.updatedAt.toISOString(),
        effectiveFrom: policy.effectiveFrom.toISOString(),
        effectiveTo: policy.effectiveTo?.toISOString() ?? null,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    }, { status: 201 });
  } catch (error) {
    console.error('[Leave Policies API] POST Error:', error);

    return NextResponse.json({
      success: false,
      error: {
        code: 'E5001',
        message: 'Failed to create leave policy',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    }, { status: 500 });
  }
});
