import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

/**
 * GET /api/benefits/eligibility/employee/:employeeId
 *
 * There is no dedicated eligibility table — eligibility is derived by evaluating
 * each active benefit plan's `eligibilityCriteria` / waiting period against the
 * employee's existing enrollments. Returns one eligibility record per active plan.
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { pathname } = new URL(request.url);
    // .../eligibility/employee/<employeeId>
    const segments = pathname.split('/').filter(Boolean);
    const employeeId = decodeURIComponent(segments[segments.length - 1] || '');

    if (!employeeId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Employee ID is required',
          messageAr: 'معرف الموظف مطلوب',
        },
        { status: 400 }
      );
    }

    const [plans, enrollments] = await Promise.all([
      prisma.benefitPlan.findMany({
        where: { tenantId: user.tenantId, status: 'ACTIVE', isDeleted: false },
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.benefitEnrollment.findMany({
        where: { tenantId: user.tenantId, employeeId, isDeleted: false },
        select: { planId: true, status: true },
      }),
    ]);

    const enrolledPlanIds = new Set(
      enrollments.filter((e) => e.status !== 'CANCELLED').map((e) => e.planId)
    );

    const now = new Date();
    const rules = plans.map((plan) => {
      const alreadyEnrolled = enrolledPlanIds.has(plan.id);
      const withinEffective =
        plan.effectiveFrom <= now && (!plan.effectiveTo || plan.effectiveTo >= now);
      const eligible = withinEffective && !alreadyEnrolled;

      let reason = 'Meets plan eligibility criteria';
      if (alreadyEnrolled) {
        reason = 'Already enrolled in this plan';
      } else if (!withinEffective) {
        reason = 'Plan is outside its effective period';
      } else if (plan.waitingPeriodDays > 0) {
        reason = `Subject to ${plan.waitingPeriodDays}-day waiting period`;
      }

      return {
        id: plan.id,
        employeeId,
        benefitPlanId: plan.id,
        benefitPlanName: plan.planName,
        category: plan.category,
        criteria: reason,
        reason,
        waitingPeriodDays: plan.waitingPeriodDays,
        status: eligible ? 'ELIGIBLE' : alreadyEnrolled ? 'ENROLLED' : 'PENDING',
      };
    });

    return NextResponse.json({ success: true, data: rules, total: rules.length }, { status: 200 });
  } catch (error: any) {
    console.error('Error computing employee eligibility:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to compute eligibility',
        messageAr: 'فشل في حساب الأهلية',
      },
      { status: 500 }
    );
  }
});
