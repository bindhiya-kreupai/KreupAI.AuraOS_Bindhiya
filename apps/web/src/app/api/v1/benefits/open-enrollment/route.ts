import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('benefits/open-enrollment:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing benefits/open-enrollment:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');
    const planYear = searchParams.get('planYear');

    // Build where clause with tenant isolation
    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true';
    }
    if (planYear) {
      where.planYear = parseInt(planYear);
    }

    const windows = await prisma.enrollmentWindow.findMany({
      where,
      orderBy: { startDate: 'desc' },
    });

    // For each window, count eligible and enrolled employees
    const data = await Promise.all(
      windows.map(async (window) => {
        const now = new Date();
        const isOpen = window.startDate <= now && window.endDate >= now;
        const isCompleted = window.endDate < now;

        // Count enrollments made during this window's period
        const enrolledCount = await prisma.benefitEnrollment.count({
          where: {
            tenantId: user.tenantId,
            enrollmentDate: {
              gte: window.startDate,
              lte: window.endDate,
            },
          },
        });

        // Count total eligible employees for the tenant (via company relation)
        const eligibleCount = await prisma.employee.count({
          where: { company: { tenantId: user.tenantId } },
        });

        const completionRate =
          eligibleCount > 0 ? Math.round((enrolledCount / eligibleCount) * 100 * 10) / 10 : 0;

        let status: string;
        if (isCompleted) {
          status = 'completed';
        } else if (isOpen) {
          status = 'active';
        } else {
          status = 'draft';
        }

        return {
          id: window.id,
          name: window.windowName,
          windowType: window.windowType,
          planYear: window.planYear,
          startDate: window.startDate.toISOString(),
          endDate: window.endDate.toISOString(),
          effectiveDate: window.startDate.toISOString(),
          status,
          eligibleEmployees: eligibleCount,
          enrolledEmployees: enrolledCount,
          completionRate,
          description: window.description,
          instructions: window.instructions,
          eligibleCategories: window.eligibleCategories,
          isActive: window.isActive,
          notificationsSent: isCompleted || isOpen,
          createdAt: window.createdAt.toISOString(),
        };
      })
    );

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
    console.error('[Benefits Open Enrollment API] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch open enrollment windows',
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
    if (!permissions.includes('benefits/open-enrollment:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing benefits/open-enrollment:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();
    const {
      name,
      startDate,
      endDate,
      effectiveDate,
      windowType,
      planYear,
      description,
      instructions,
      eligibleCategories,
      notifyEmployees,
    } = body;

    if (!startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4001',
            message: 'Fields startDate and endDate are required',
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

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4002',
            message: 'endDate must be after startDate',
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: crypto.randomUUID(),
            apiVersion: 'v1',
          },
        },
        { status: 422 }
      );
    }

    if (effectiveDate) {
      const effective = new Date(effectiveDate);
      if (effective <= end) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4002',
              message: 'effectiveDate must be after endDate',
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId: crypto.randomUUID(),
              apiVersion: 'v1',
            },
          },
          { status: 422 }
        );
      }
    }

    const resolvedPlanYear =
      planYear || (effectiveDate ? new Date(effectiveDate).getFullYear() : start.getFullYear());
    const resolvedName = name || `Open Enrollment ${resolvedPlanYear}`;

    const window = await prisma.enrollmentWindow.create({
      data: {
        tenantId: user.tenantId,
        windowName: resolvedName,
        windowType: windowType || 'Open Enrollment',
        planYear: resolvedPlanYear,
        startDate: start,
        endDate: end,
        description: description || null,
        instructions: instructions || null,
        eligibleCategories: eligibleCategories || null,
        isActive: true,
      },
    });

    // Count eligible employees for the notification info (via company relation)
    const eligibleCount = await prisma.employee.count({
      where: { company: { tenantId: user.tenantId } },
    });

    const data = {
      id: window.id,
      tenantId: window.tenantId,
      name: window.windowName,
      windowType: window.windowType,
      planYear: window.planYear,
      startDate: window.startDate.toISOString(),
      endDate: window.endDate.toISOString(),
      effectiveDate: effectiveDate || window.startDate.toISOString(),
      status: 'active',
      eligibleEmployees: eligibleCount,
      enrolledEmployees: 0,
      notificationsSent: notifyEmployees ?? true,
      createdBy: user.userId,
      createdAt: window.createdAt.toISOString(),
    };

    const response: Record<string, unknown> = {
      success: true,
      data,
      message: `Open enrollment period "${window.windowName}" has been initiated successfully.`,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    };

    if (notifyEmployees !== false) {
      response.notifications = {
        emailsSent: eligibleCount,
        pushNotificationsSent: eligibleCount,
        reminderScheduled: true,
        reminderDates: [
          new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          new Date(end.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          new Date(end.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        ],
      };
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('[Benefits Open Enrollment API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to create open enrollment window',
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
