import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.BENEFITS, Action.READ, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;

      // Run all queries in parallel for performance
      const [
        totalPlans,
        totalEnrollments,
        enrollmentsByStatus,
        claimsByStatus,
        totalDependents,
        premiumAggregation,
        totalClaimAmounts,
      ] = await Promise.all([
        // Total benefit plans
        prisma.benefitPlan.count({
          where: { tenantId },
        }),

        // Total enrollments
        prisma.benefitEnrollment.count({
          where: { tenantId },
        }),

        // Enrollments grouped by status
        prisma.benefitEnrollment.groupBy({
          by: ['status'],
          where: { tenantId },
          _count: { id: true },
        }),

        // Claims grouped by status
        prisma.benefitClaim.groupBy({
          by: ['status'],
          where: { tenantId },
          _count: { id: true },
          _sum: { claimAmount: true, approvedAmount: true, paidAmount: true },
        }),

        // Total dependents
        prisma.dependent.count({
          where: { tenantId },
        }),

        // Premium deduction aggregation
        prisma.premiumDeduction.aggregate({
          where: { tenantId },
          _sum: { deductionAmount: true },
          _count: { id: true },
        }),

        // Total claim amounts
        prisma.benefitClaim.aggregate({
          where: { tenantId },
          _sum: { claimAmount: true, approvedAmount: true, paidAmount: true },
          _count: { id: true },
        }),
      ]);

      // Compute enrollment stats
      const activeEnrollments = enrollmentsByStatus.find(e => e.status === 'ACTIVE')?._count?.id || 0;
      const enrollmentRate = totalEnrollments > 0
        ? parseFloat(((activeEnrollments / totalEnrollments) * 100).toFixed(1))
        : 0;

      // Compute claim stats
      const totalClaims = totalClaimAmounts._count?.id || 0;
      const approvedClaims = claimsByStatus.find(c => c.status === 'APPROVED')?._count?.id || 0;
      const partiallyApprovedClaims = claimsByStatus.find(c => c.status === 'PARTIALLY_APPROVED')?._count?.id || 0;
      const paidClaims = claimsByStatus.find(c => c.status === 'PAID')?._count?.id || 0;
      const deniedClaims = claimsByStatus.find(c => c.status === 'REJECTED')?._count?.id || 0;

      const totalClaimAmount = totalClaimAmounts._sum?.claimAmount || 0;
      const totalPaidAmount = totalClaimAmounts._sum?.paidAmount || 0;
      const totalApprovedAmount = totalClaimAmounts._sum?.approvedAmount || 0;

      const claimApprovalRate = totalClaims > 0
        ? parseFloat((((approvedClaims + partiallyApprovedClaims + paidClaims) / totalClaims) * 100).toFixed(1))
        : 0;

      // Compute premium stats
      const totalPremiums = premiumAggregation._sum?.deductionAmount || 0;

      // Compute enrollment premium totals from active enrollments
      const enrollmentPremiums = await prisma.benefitEnrollment.aggregate({
        where: { tenantId, status: 'ACTIVE' },
        _sum: { employeePremium: true, employerPremium: true, totalPremium: true },
      });

      const employeeContributions = enrollmentPremiums._sum?.employeePremium || 0;
      const employerContributions = enrollmentPremiums._sum?.employerPremium || 0;

      // Unique employees enrolled
      const uniqueEmployees = await prisma.benefitEnrollment.findMany({
        where: { tenantId, status: 'ACTIVE' },
        select: { employeeId: true },
        distinct: ['employeeId'],
      });

      const averageDependentsPerEmployee = uniqueEmployees.length > 0
        ? parseFloat((totalDependents / uniqueEmployees.length).toFixed(1))
        : 0;

      const averagePremiumPerEmployee = uniqueEmployees.length > 0
        ? parseFloat(((employeeContributions + employerContributions) / uniqueEmployees.length).toFixed(2))
        : 0;

      const averageClaimAmount = totalClaims > 0
        ? parseFloat((totalClaimAmount / totalClaims).toFixed(2))
        : 0;

      // Enrollments by category
      const enrollmentsByCategory = await prisma.benefitEnrollment.findMany({
        where: { tenantId, status: 'ACTIVE' },
        select: { plan: { select: { category: true } } },
      });

      const categoryMap: Record<string, number> = {};
      for (const e of enrollmentsByCategory) {
        const cat = e.plan.category;
        categoryMap[cat] = (categoryMap[cat] || 0) + 1;
      }

      // Enrollments by plan
      const enrollmentsByPlan = await prisma.benefitEnrollment.groupBy({
        by: ['planId'],
        where: { tenantId, status: 'ACTIVE' },
        _count: { id: true },
      });

      const planDetails = await prisma.benefitPlan.findMany({
        where: { tenantId, id: { in: enrollmentsByPlan.map(e => e.planId) } },
        select: { id: true, planName: true },
      });

      const planNameMap = new Map(planDetails.map(p => [p.id, p.planName]));

      const enrollmentsByPlanResult = enrollmentsByPlan.map(e => ({
        planId: e.planId,
        planName: planNameMap.get(e.planId) || 'Unknown',
        count: e._count.id,
        percentage: activeEnrollments > 0
          ? parseFloat(((e._count.id / activeEnrollments) * 100).toFixed(1))
          : 0,
      }));

      const analytics = {
        totalEnrollments,
        activeEnrollments,
        enrollmentRate,
        enrollmentsByCategory: categoryMap,
        enrollmentsByPlan: enrollmentsByPlanResult,
        totalPremiums,
        employeeContributions,
        employerContributions,
        averagePremiumPerEmployee,
        totalClaims,
        approvedClaims: approvedClaims + partiallyApprovedClaims + paidClaims,
        deniedClaims,
        totalClaimAmount,
        totalPaidAmount,
        averageClaimAmount,
        claimApprovalRate,
        totalDependents,
        averageDependentsPerEmployee,
        enrollmentTrend: 'stable' as const,
        costTrend: 'stable' as const,
      };

      return NextResponse.json({ success: true, data: analytics });
    } catch (error: any) {
      logger.error('Error fetching analytics:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 });
    }
  }
);
