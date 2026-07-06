import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

// Map the wizard's coverage-tier tokens onto the real CoverageLevel enum.
const COVERAGE_LEVEL_MAP: Record<string, string> = {
  EMPLOYEE_ONLY: 'EMPLOYEE_ONLY',
  EMPLOYEE_SPOUSE: 'EMPLOYEE_SPOUSE',
  EMPLOYEE_CHILDREN: 'EMPLOYEE_CHILDREN',
  FAMILY: 'FAMILY',
};

// Map the wizard's enrollment-type tokens onto the real BenefitEnrollmentType enum.
const ENROLLMENT_TYPE_MAP: Record<string, string> = {
  ANNUAL: 'OPEN_ENROLLMENT',
  OPEN_ENROLLMENT: 'OPEN_ENROLLMENT',
  NEW_HIRE: 'NEW_HIRE',
  QUALIFYING_EVENT: 'QUALIFYING_EVENT',
  ANNUAL_RENEWAL: 'ANNUAL_RENEWAL',
  SPECIAL_ENROLLMENT: 'SPECIAL_ENROLLMENT',
};

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
            messageAr: 'ممنوع: صلاحية قراءة تسجيلات المزايا مفقودة',
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

    const where: Record<string, unknown> = { tenantId: user.tenantId, isDeleted: false };
    if (employeeId) where.employeeId = employeeId;
    if (planId) where.planId = planId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.benefitEnrollment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { enrollmentDate: 'desc' },
        include: {
          plan: {
            select: { id: true, planName: true, planCode: true, category: true, carrierName: true },
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
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch benefit enrollments',
          messageAr: 'فشل في جلب تسجيلات المزايا',
        },
      },
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
            messageAr: 'ممنوع: صلاحية إنشاء تسجيلات المزايا مفقودة',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();

    if (!body.employeeId || !body.planId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'employeeId and planId are required',
            messageAr: 'معرّف الموظف ومعرّف الخطة مطلوبان',
          },
        },
        { status: 400 }
      );
    }

    // Resolve the coverage level and enrollment type onto the real enums.
    const coverageLevel =
      COVERAGE_LEVEL_MAP[String(body.coverageTier || body.coverageLevel || '').toUpperCase()] ||
      'EMPLOYEE_ONLY';
    const enrollmentType =
      ENROLLMENT_TYPE_MAP[String(body.enrollmentType || 'OPEN_ENROLLMENT').toUpperCase()] ||
      'OPEN_ENROLLMENT';

    // Check if already enrolled in this plan (active or awaiting approval).
    const existing = await prisma.benefitEnrollment.findFirst({
      where: {
        tenantId: user.tenantId,
        employeeId: body.employeeId,
        planId: body.planId,
        isDeleted: false,
        status: { in: ['ACTIVE', 'APPROVED', 'PENDING_APPROVAL', 'DRAFT'] },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E3002',
            message: 'Employee is already enrolled in this benefit plan',
            messageAr: 'الموظف مسجّل بالفعل في خطة المزايا هذه',
          },
        },
        { status: 409 }
      );
    }

    // Verify plan exists and is active.
    const plan = await prisma.benefitPlan.findFirst({
      where: { id: body.planId, tenantId: user.tenantId, status: 'ACTIVE' },
    });

    if (!plan) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4001',
            message: 'Benefit plan not found or not active',
            messageAr: 'خطة المزايا غير موجودة أو غير نشطة',
          },
        },
        { status: 404 }
      );
    }

    // Resolve the employee to populate the denormalized identity fields the model
    // requires. Employee is tenant-scoped through its company relation.
    const employee = await prisma.employee.findFirst({
      where: { id: body.employeeId, company: { tenantId: user.tenantId } },
      select: {
        firstName: true,
        lastName: true,
        employeeCode: true,
        departmentId: true,
        department: { select: { id: true, name: true } },
      },
    });

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4002',
            message: 'Employee not found',
            messageAr: 'الموظف غير موجود',
          },
        },
        { status: 404 }
      );
    }

    const employeePremium =
      typeof body.employeeContribution === 'number'
        ? body.employeeContribution
        : plan.employeePremium;
    const employerPremium =
      typeof body.employerContribution === 'number'
        ? body.employerContribution
        : plan.employerPremium;

    const enrollment = await prisma.benefitEnrollment.create({
      data: {
        tenantId: user.tenantId,
        employeeId: body.employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
        employeeCode: employee.employeeCode,
        departmentId: employee.departmentId,
        departmentName: employee.department?.name ?? null,
        planId: body.planId,
        coverageLevel: coverageLevel as any,
        enrollmentType: enrollmentType as any,
        status: 'PENDING_APPROVAL',
        effectiveFrom: body.effectiveDate ? new Date(body.effectiveDate) : new Date(),
        employeePremium,
        employerPremium,
        totalPremium: employeePremium + employerPremium,
        enrolledDependents: body.dependents ?? [],
        createdBy: user.userId,
      },
      include: {
        plan: { select: { id: true, planName: true, category: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: enrollment,
        message: 'Successfully enrolled in benefit plan',
        messageAr: 'تم التسجيل في خطة المزايا بنجاح',
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
          messageAr: 'فشل في إنشاء تسجيل المزايا',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
      },
      { status: 500 }
    );
  }
});
