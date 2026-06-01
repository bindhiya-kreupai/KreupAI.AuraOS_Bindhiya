import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('benefits/enrollment:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing benefits/enrollment:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');

    const skip = (page - 1) * limit;

    // Build where clause with tenant isolation
    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (status) {
      where.status = status.toUpperCase();
    }
    if (employeeId) {
      where.employeeId = employeeId;
    }

    const [enrollments, total] = await Promise.all([
      prisma.benefitEnrollment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { enrollmentDate: 'desc' },
        include: {
          plan: {
            select: {
              planName: true,
              category: true,
              carrierName: true,
            },
          },
        },
      }),
      prisma.benefitEnrollment.count({ where }),
    ]);

    // Map DB records to the API response shape the frontend expects
    const data = enrollments.map((enrollment) => ({
      id: enrollment.id,
      employeeId: enrollment.employeeId,
      employeeName: enrollment.employeeName,
      employeeCode: enrollment.employeeCode,
      planId: enrollment.planId,
      planName: enrollment.plan.planName,
      planCategory: enrollment.plan.category.toLowerCase().replace(/_/g, '-'),
      coverageLevel: enrollment.coverageLevel.toLowerCase(),
      status: enrollment.status.toLowerCase(),
      effectiveDate: enrollment.effectiveFrom.toISOString(),
      endDate: enrollment.effectiveTo?.toISOString() ?? null,
      premiumEmployee: enrollment.employeePremium,
      premiumEmployer: enrollment.employerPremium,
      premiumTotal: enrollment.totalPremium,
      payFrequency: enrollment.paymentFrequency.toLowerCase(),
      coveredDependents: enrollment.enrolledDependents ?? [],
      enrolledAt: enrollment.enrollmentDate.toISOString(),
      lastModifiedAt: enrollment.updatedAt.toISOString(),
      enrollmentType: enrollment.enrollmentType,
      departmentId: enrollment.departmentId,
      departmentName: enrollment.departmentName,
    }));

    // Compute summary across all enrollments for this tenant
    const summaryAgg = await prisma.benefitEnrollment.aggregate({
      where: { tenantId: user.tenantId, status: 'ACTIVE' },
      _sum: {
        employeePremium: true,
        employerPremium: true,
      },
      _count: true,
    });

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        totalMonthlyEmployeeCost: summaryAgg._sum.employeePremium ?? 0,
        totalMonthlyEmployerCost: summaryAgg._sum.employerPremium ?? 0,
        activePlans: summaryAgg._count,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error) {
    console.error('[Benefits Enrollment API] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch enrollments',
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

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('benefits/enrollment:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing benefits/enrollment:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();
    const {
      planId,
      coverageLevel,
      dependentIds,
      effectiveDate,
      employeeId,
      employeeName,
      employeeCode,
      enrollmentType,
    } = body;

    if (!planId || !coverageLevel) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4001',
            message: 'Fields planId and coverageLevel are required',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 400 }
      );
    }

    // Fetch the plan to get premium information
    const plan = await prisma.benefitPlan.findFirst({
      where: { id: planId, tenantId: user.tenantId },
    });

    if (!plan) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4004',
            message: 'Benefit plan not found',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 404 }
      );
    }

    // Determine premiums based on coverage level
    const coverageLevelEnum = coverageLevel.toUpperCase().replace(/-/g, '_');
    let employeePremium = plan.employeePremium;
    const employerPremium = plan.employerPremium;

    if (coverageLevelEnum === 'EMPLOYEE_SPOUSE' && plan.spousePremium != null) {
      employeePremium = plan.spousePremium;
    } else if (coverageLevelEnum === 'EMPLOYEE_CHILDREN' && plan.childPremium != null) {
      employeePremium = plan.childPremium;
    } else if (coverageLevelEnum === 'FAMILY' && plan.familyPremium != null) {
      employeePremium = plan.familyPremium;
    }

    const totalPremium = employeePremium + employerPremium;

    // Look up employee info if not provided
    let resolvedEmployeeName = employeeName;
    let resolvedEmployeeCode = employeeCode;
    const resolvedEmployeeId = employeeId || context.employeeId;

    if (resolvedEmployeeId && (!resolvedEmployeeName || !resolvedEmployeeCode)) {
      const employee = await prisma.employee.findUnique({
        where: { id: resolvedEmployeeId },
        select: { firstName: true, lastName: true, employeeCode: true },
      });
      if (employee) {
        resolvedEmployeeName =
          resolvedEmployeeName || `${employee.firstName} ${employee.lastName}`.trim();
        resolvedEmployeeCode = resolvedEmployeeCode || employee.employeeCode;
      }
    }

    const enrollment = await prisma.benefitEnrollment.create({
      data: {
        tenantId: user.tenantId,
        employeeId: resolvedEmployeeId || '',
        employeeName: resolvedEmployeeName || '',
        employeeCode: resolvedEmployeeCode || '',
        planId: plan.id,
        coverageLevel: coverageLevelEnum as any,
        enrollmentType: (enrollmentType?.toUpperCase() || 'OPEN_ENROLLMENT') as any,
        status: 'PENDING_APPROVAL',
        effectiveFrom: effectiveDate ? new Date(effectiveDate) : plan.effectiveFrom,
        employeePremium,
        employerPremium,
        totalPremium,
        paymentFrequency: 'MONTHLY',
        enrolledDependents: dependentIds ?? [],
        enrollmentDate: new Date(),
      },
      include: {
        plan: {
          select: {
            planName: true,
            category: true,
          },
        },
      },
    });

    const confirmationNumber = `ENR-${enrollment.id.substring(0, 8).toUpperCase()}`;

    const data = {
      id: enrollment.id,
      employeeId: enrollment.employeeId,
      planId: enrollment.planId,
      planName: enrollment.plan.planName,
      planCategory: enrollment.plan.category.toLowerCase().replace(/_/g, '-'),
      coverageLevel: enrollment.coverageLevel.toLowerCase(),
      status: enrollment.status.toLowerCase(),
      effectiveDate: enrollment.effectiveFrom.toISOString(),
      endDate: enrollment.effectiveTo?.toISOString() ?? null,
      premiumEmployee: enrollment.employeePremium,
      premiumEmployer: enrollment.employerPremium,
      premiumTotal: enrollment.totalPremium,
      payFrequency: enrollment.paymentFrequency.toLowerCase(),
      coveredDependents: enrollment.enrolledDependents ?? [],
      enrolledAt: enrollment.enrollmentDate.toISOString(),
      lastModifiedAt: enrollment.updatedAt.toISOString(),
      confirmationNumber,
    };

    return NextResponse.json(
      {
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Benefits Enrollment API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to create enrollment',
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
