import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/benefits/enrollments
 * List benefit enrollments with pagination and filters
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('benefits/enrollments:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing benefits/enrollments:read permission',
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

    const employeeId = searchParams.get('employeeId') || undefined;
    const planId = searchParams.get('planId') || undefined;
    const status = searchParams.get('status') || undefined;

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (employeeId) where.employeeId = employeeId;
    if (planId) where.planId = planId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.benefitEnrollment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { enrolledAt: 'desc' },
        include: {
          plan: {
            select: { id: true, planName: true, planCode: true, category: true, carrierName: true },
          },
          employee: {
            select: { id: true, firstName: true, lastName: true, employeeCode: true },
          },
        },
      }),
      prisma.benefitEnrollment.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      meta: {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[Benefits Enrollments API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch benefit enrollments' } },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/benefits/enrollments
 * Enroll an employee in a benefit plan
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('benefits/enrollments:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing benefits/enrollments:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();

    if (!body.employeeId || !body.planId) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'employeeId and planId are required' } },
        { status: 400 }
      );
    }

    // Check if already enrolled in this plan
    const existing = await prisma.benefitEnrollment.findFirst({
      where: {
        tenantId: user.tenantId,
        employeeId: body.employeeId,
        planId: body.planId,
        status: { in: ['ACTIVE', 'PENDING'] },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E3002', message: 'Employee is already enrolled in this benefit plan' },
        },
        { status: 409 }
      );
    }

    // Verify plan exists and is active
    const plan = await prisma.benefitPlan.findFirst({
      where: { id: body.planId, tenantId: user.tenantId, status: 'ACTIVE' },
    });

    if (!plan) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E4001', message: 'Benefit plan not found or not active' },
        },
        { status: 404 }
      );
    }

    const enrollment = await prisma.benefitEnrollment.create({
      data: {
        tenantId: user.tenantId,
        employeeId: body.employeeId,
        planId: body.planId,
        coverageTier: body.coverageTier || 'EMPLOYEE_ONLY',
        effectiveDate: body.effectiveDate ? new Date(body.effectiveDate) : new Date(),
        enrolledAt: new Date(),
        enrolledBy: user.id,
        status: 'PENDING',
        dependents: body.dependents || [],
        employeeContribution: body.employeeContribution || plan.employeePremium,
        employerContribution: body.employerContribution || plan.employerPremium,
      },
      include: {
        plan: { select: { id: true, planName: true, category: true } },
        employee: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: enrollment,
        message: 'Successfully enrolled in benefit plan',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Benefits Enrollments API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to create benefit enrollment',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
      },
      { status: 500 }
    );
  }
});
