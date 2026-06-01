import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('benefits/plans:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing benefits/plans:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');

    const skip = (page - 1) * limit;

    // Build where clause with tenant isolation
    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (category) {
      where.category = category.toUpperCase().replace(/-/g, '_');
    }

    const [plans, total] = await Promise.all([
      prisma.benefitPlan.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ displayOrder: 'asc' }, { planName: 'asc' }],
        include: {
          _count: {
            select: { enrollments: true },
          },
        },
      }),
      prisma.benefitPlan.count({ where }),
    ]);

    // Map DB records to the API response shape the frontend expects
    const data = plans.map((plan) => ({
      id: plan.id,
      name: plan.planName,
      planCode: plan.planCode,
      category: plan.category.toLowerCase().replace(/_/g, '-'),
      type: plan.planTier || plan.category,
      provider: plan.carrierName,
      status: plan.status.toLowerCase(),
      premiums: {
        employeeOnly: plan.employeePremium,
        employeeSpouse: plan.spousePremium ?? plan.employeePremium,
        employeeChildren: plan.childPremium ?? plan.employeePremium,
        family: plan.familyPremium ?? plan.employeePremium,
      },
      employerContribution: plan.employerPremium,
      deductible: plan.deductible
        ? { individual: plan.deductible, family: (plan.deductible ?? 0) * 2 }
        : null,
      outOfPocketMax: plan.outOfPocketMax
        ? { individual: plan.outOfPocketMax, family: (plan.outOfPocketMax ?? 0) * 2 }
        : null,
      copay: plan.copay ?? null,
      coinsurance: plan.coinsurance ?? null,
      coverage: plan.coverage ?? null,
      networkInfo: plan.networkInfo ?? null,
      description: plan.description,
      effectiveFrom: plan.effectiveFrom.toISOString(),
      effectiveTo: plan.effectiveTo?.toISOString() ?? null,
      waitingPeriodDays: plan.waitingPeriodDays,
      isEmployeeContribution: plan.isEmployeeContribution,
      enrollmentCount: plan._count.enrollments,
    }));

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error) {
    console.error('[Benefits Plans API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch benefit plans',
          details: {
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 500 }
    );
  }
});
