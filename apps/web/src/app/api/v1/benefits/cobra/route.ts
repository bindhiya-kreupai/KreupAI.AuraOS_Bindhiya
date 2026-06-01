import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/benefits/cobra
 * Get list of COBRA-eligible former employees
 * COBRA (Consolidated Omnibus Budget Reconciliation Act) allows employees who lose
 * health benefits to continue coverage for a limited period
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('benefits/cobra:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing benefits/cobra:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const status = searchParams.get('status') || undefined; // ELIGIBLE, ENROLLED, EXPIRED, DECLINED

    // Find employees who recently exited/terminated and had health benefit enrollments
    // COBRA eligibility window: typically 60 days from qualifying event
    const _sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const eighteenMonthsAgo = new Date(Date.now() - 18 * 30 * 24 * 60 * 60 * 1000);

    const exitRequests = await prisma.exitRequest.findMany({
      where: {
        tenantId: user.tenantId,
        status: 'COMPLETED',
        lastWorkingDate: { gte: eighteenMonthsAgo },
      },
      skip,
      take: limit,
      orderBy: { lastWorkingDate: 'desc' },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            employeeCode: true,
            benefitEnrollments: {
              where: { status: { in: ['ACTIVE', 'TERMINATED'] } },
              include: {
                plan: {
                  select: { id: true, planName: true, category: true, employeePremium: true },
                },
              },
            },
          },
        },
      },
    });

    const cobraEligible = exitRequests
      .filter((exit) => exit.employee.benefitEnrollments.some((e: any) => e.plan.category === 'MEDICAL'))
      .map((exit) => {
        const lastWorkingDate = exit.lastWorkingDate || exit.updatedAt;
        const cobraDeadline = new Date(lastWorkingDate.getTime() + 60 * 24 * 60 * 60 * 1000);
        const cobraMaxEndDate = new Date(lastWorkingDate.getTime() + 18 * 30 * 24 * 60 * 60 * 1000);
        const isEligible = new Date() <= cobraDeadline;

        return {
          exitId: exit.id,
          employee: {
            id: exit.employee.id,
            name: `${exit.employee.firstName} ${exit.employee.lastName}`,
            email: exit.employee.email,
            employeeCode: exit.employee.employeeCode,
          },
          separationDate: lastWorkingDate,
          separationReason: exit.exitReason,
          cobraElectionDeadline: cobraDeadline,
          cobraMaxEndDate,
          isEligible,
          status: isEligible ? 'ELIGIBLE' : 'DEADLINE_PASSED',
          eligiblePlans: exit.employee.benefitEnrollments
            .filter((e: any) => e.plan.category === 'MEDICAL')
            .map((e: any) => ({
              planId: e.planId,
              planName: e.plan.planName,
              monthlyCost: Number(e.plan.employeePremium || 0) * 1.02, // COBRA typically adds 2% admin fee
            })),
        };
      })
      .filter((item) => !status || item.status === status);

    return NextResponse.json({
      success: true,
      data: cobraEligible,
      meta: {
        pagination: {
          page,
          limit,
          total: cobraEligible.length,
          totalPages: Math.ceil(cobraEligible.length / limit),
        },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[COBRA API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch COBRA eligible list' } },
      { status: 500 }
    );
  }
});
