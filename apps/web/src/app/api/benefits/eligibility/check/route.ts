import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

const checkSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  benefitPlanId: z.string().min(1, 'Benefit plan ID is required'),
});

/**
 * POST /api/benefits/eligibility/check
 * Evaluate whether a specific employee is eligible for a specific plan.
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();
    const { employeeId, benefitPlanId } = checkSchema.parse(body);

    const plan = await prisma.benefitPlan.findFirst({
      where: { id: benefitPlanId, tenantId: user.tenantId, isDeleted: false },
    });

    if (!plan) {
      return NextResponse.json(
        {
          success: false,
          message: 'Benefit plan not found',
          messageAr: 'لم يتم العثور على خطة المزايا',
        },
        { status: 404 }
      );
    }

    const existingEnrollment = await prisma.benefitEnrollment.findFirst({
      where: {
        tenantId: user.tenantId,
        employeeId,
        planId: benefitPlanId,
        isDeleted: false,
        status: { not: 'CANCELLED' },
      },
    });

    const now = new Date();
    const withinEffective =
      plan.effectiveFrom <= now && (!plan.effectiveTo || plan.effectiveTo >= now);
    const isActive = plan.status === 'ACTIVE';
    const eligible = withinEffective && isActive && !existingEnrollment;

    let reason = 'Meets plan eligibility criteria';
    if (existingEnrollment) {
      reason = 'Already enrolled in this plan';
    } else if (!isActive) {
      reason = 'Plan is not currently active';
    } else if (!withinEffective) {
      reason = 'Plan is outside its effective period';
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          employeeId,
          benefitPlanId,
          benefitPlanName: plan.planName,
          eligible,
          status: eligible ? 'ELIGIBLE' : existingEnrollment ? 'ENROLLED' : 'INELIGIBLE',
          reason,
          waitingPeriodDays: plan.waitingPeriodDays,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation error',
          messageAr: 'خطأ في التحقق من صحة البيانات',
          details: error.errors,
        },
        { status: 400 }
      );
    }
    console.error('Error checking eligibility:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to check eligibility',
        messageAr: 'فشل في التحقق من الأهلية',
      },
      { status: 500 }
    );
  }
});
