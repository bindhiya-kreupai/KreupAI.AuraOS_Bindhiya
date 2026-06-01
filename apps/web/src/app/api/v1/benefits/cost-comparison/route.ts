import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('benefits/cost-comparison:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing benefits/cost-comparison:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'HEALTH_INSURANCE';
    const coverageLevel = searchParams.get('coverageLevel') || 'employee_only';
    const planIds = searchParams.get('planIds')?.split(',').filter(Boolean);

    // Normalize category to enum format
    const categoryEnum = category.toUpperCase().replace(/-/g, '_');

    // Build where clause with tenant isolation
    const where: Record<string, unknown> = {
      tenantId: user.tenantId,
      category: categoryEnum,
      status: 'ACTIVE',
    };
    if (planIds?.length) {
      where.id = { in: planIds };
    }

    // Fetch plans with their premium rates
    const plans = await prisma.benefitPlan.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
      include: {
        premiumRates: {
          orderBy: { effectiveFrom: 'desc' },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    // Map plans to the cost comparison response shape
    const comparisonPlans = plans.map((plan) => {
      // Build coverage levels from premium rates if available, otherwise from plan defaults
      const coverageLevels = buildCoverageLevels(plan);

      const deductible = plan.deductible
        ? { individual: plan.deductible, family: (plan.deductible ?? 0) * 2 }
        : { individual: 0, family: 0 };

      const outOfPocketMax = plan.outOfPocketMax
        ? { individual: plan.outOfPocketMax, family: (plan.outOfPocketMax ?? 0) * 2 }
        : { individual: 0, family: 0 };

      // Estimate annual costs based on deductible and premiums
      const employeeOnlyCoverage = coverageLevels.find((c) => c.level === 'employee_only');
      const annualEmployeePremium = employeeOnlyCoverage?.annualEmployeeCost ?? 0;
      const estimatedAnnualCost = {
        low: annualEmployeePremium + deductible.individual * 0.1,
        medium: annualEmployeePremium + deductible.individual * 0.5,
        high: annualEmployeePremium + (plan.outOfPocketMax ?? deductible.individual),
      };

      // Determine HSA eligibility from coverage JSON or plan tier
      const coverageData = plan.coverage as Record<string, unknown> | null;
      const hsaEligible =
        coverageData?.hsaEligible === true ||
        plan.planTier === 'BASIC' ||
        (plan.deductible != null && plan.deductible >= 1600);

      return {
        planId: plan.id,
        planName: plan.planName,
        planCode: plan.planCode,
        category: plan.category.toLowerCase().replace(/_/g, '-'),
        type: plan.planTier || plan.category,
        provider: plan.carrierName,
        coverageLevels,
        deductible,
        outOfPocketMax,
        estimatedAnnualCost,
        hsaEligible,
        enrollmentCount: plan._count.enrollments,
        description: plan.description,
      };
    });

    // Calculate savings comparison
    let savings = null;
    if (comparisonPlans.length >= 2) {
      const annualCosts = comparisonPlans.map((p) => {
        const level = p.coverageLevels.find(
          (c) => c.level === coverageLevel.toLowerCase().replace(/-/g, '_')
        );
        return { planId: p.planId, cost: level?.annualEmployeeCost ?? 0 };
      });

      const minCost = annualCosts.reduce((min, c) => (c.cost < min.cost ? c : min));
      const maxCost = annualCosts.reduce((max, c) => (c.cost > max.cost ? c : max));

      savings = {
        lowestCostPlan: minCost.planId,
        potentialAnnualSavings: maxCost.cost - minCost.cost,
      };
    }

    const data = {
      plans: comparisonPlans,
      coverageLevel,
      savings,
      disclaimer:
        'Estimated costs are based on average usage patterns. Actual costs may vary based on individual healthcare utilization.',
    };

    return NextResponse.json({
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error) {
    console.error('[Benefits Cost Comparison API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch cost comparison',
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

/**
 * Build coverage levels from plan data and premium rates.
 * Returns an array of coverage level objects with cost breakdowns.
 */
function buildCoverageLevels(plan: {
  employeePremium: number;
  employerPremium: number;
  spousePremium: number | null;
  childPremium: number | null;
  familyPremium: number | null;
  premiumRates: {
    coverageLevel: string;
    employeePremium: number;
    employerPremium: number;
    totalPremium: number;
  }[];
}) {
  const levels: {
    level: string;
    employeeMonthlyCost: number;
    employerMonthlyCost: number;
    totalMonthlyCost: number;
    annualEmployeeCost: number;
    annualTotalCost: number;
  }[] = [];

  // Check if premium rates exist for detailed tier pricing
  const ratesByLevel = new Map<string, (typeof plan.premiumRates)[0]>();
  for (const rate of plan.premiumRates) {
    const levelKey = rate.coverageLevel.toLowerCase();
    if (!ratesByLevel.has(levelKey)) {
      ratesByLevel.set(levelKey, rate);
    }
  }

  const coverageTiers = [
    {
      level: 'employee_only',
      enumKey: 'EMPLOYEE_ONLY',
      defaultEmployee: plan.employeePremium,
      defaultEmployer: plan.employerPremium,
    },
    {
      level: 'employee_spouse',
      enumKey: 'EMPLOYEE_SPOUSE',
      defaultEmployee: plan.spousePremium ?? plan.employeePremium * 2,
      defaultEmployer: plan.employerPremium * 2,
    },
    {
      level: 'employee_children',
      enumKey: 'EMPLOYEE_CHILDREN',
      defaultEmployee: plan.childPremium ?? plan.employeePremium * 1.8,
      defaultEmployer: plan.employerPremium * 1.8,
    },
    {
      level: 'family',
      enumKey: 'FAMILY',
      defaultEmployee: plan.familyPremium ?? plan.employeePremium * 2.8,
      defaultEmployer: plan.employerPremium * 2.8,
    },
  ];

  for (const tier of coverageTiers) {
    const rate = ratesByLevel.get(tier.enumKey.toLowerCase()) || ratesByLevel.get(tier.level);
    const employeeMonthlyCost = rate ? rate.employeePremium : tier.defaultEmployee;
    const employerMonthlyCost = rate ? rate.employerPremium : tier.defaultEmployer;
    const totalMonthlyCost = rate ? rate.totalPremium : employeeMonthlyCost + employerMonthlyCost;

    levels.push({
      level: tier.level,
      employeeMonthlyCost: Math.round(employeeMonthlyCost * 100) / 100,
      employerMonthlyCost: Math.round(employerMonthlyCost * 100) / 100,
      totalMonthlyCost: Math.round(totalMonthlyCost * 100) / 100,
      annualEmployeeCost: Math.round(employeeMonthlyCost * 12 * 100) / 100,
      annualTotalCost: Math.round(totalMonthlyCost * 12 * 100) / 100,
    });
  }

  return levels;
}
