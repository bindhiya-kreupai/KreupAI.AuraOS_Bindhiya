import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const now = new Date();

    // Find current active enrollment window
    const currentWindow = await prisma.enrollmentWindow.findFirst({
      where: {
        tenantId: user.tenantId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { startDate: 'desc' },
    });

    // Find upcoming enrollment windows
    const upcomingWindows = await prisma.enrollmentWindow.findMany({
      where: {
        tenantId: user.tenantId,
        isActive: true,
        startDate: { gt: now },
      },
      orderBy: { startDate: 'asc' },
      take: 5,
    });

    // Get the employee's active enrollments to determine completion status
    const employeeId = context.employeeId;
    let employeeEnrollments: any[] = [];
    if (employeeId) {
      employeeEnrollments = await prisma.benefitEnrollment.findMany({
        where: {
          tenantId: user.tenantId,
          employeeId,
          status: { in: ['ACTIVE', 'PENDING_APPROVAL', 'APPROVED'] },
        },
        include: {
          plan: {
            select: {
              planName: true,
              category: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
    }

    // Get qualifying life events for the employee
    const qualifyingEvents = employeeId
      ? await prisma.qualifyingEvent.findMany({
          where: {
            tenantId: user.tenantId,
            employeeId,
            isActive: true,
          },
          orderBy: { eventDate: 'desc' },
          take: 10,
        })
      : [];

    // Build current period info
    let currentPeriod = null;
    if (currentWindow) {
      const daysRemaining = Math.max(
        0,
        Math.ceil(
          (currentWindow.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
      );
      currentPeriod = {
        id: currentWindow.id,
        name: currentWindow.windowName,
        type: currentWindow.windowType.toLowerCase().replace(/\s+/g, '_'),
        status: 'active',
        startDate: currentWindow.startDate.toISOString(),
        endDate: currentWindow.endDate.toISOString(),
        effectiveDate: currentWindow.startDate.toISOString(),
        daysRemaining,
        isOpen: true,
        description: currentWindow.description,
        instructions: currentWindow.instructions,
      };
    }

    // Determine enrollment actions based on enrolled categories
    const enrolledCategories = new Set(
      employeeEnrollments.map((e) => e.plan.category)
    );
    const allBenefitCategories = [
      'HEALTH_INSURANCE',
      'DENTAL',
      'VISION',
      'LIFE_INSURANCE',
      'RETIREMENT',
    ];

    const requiredActions = allBenefitCategories.map((cat) => {
      const catLower = cat.toLowerCase().replace(/_/g, '-');
      const isCompleted = enrolledCategories.has(cat);
      const lastEnrollment = employeeEnrollments.find(
        (e) => e.plan.category === cat
      );
      return {
        action: `review_${catLower.replace(/-/g, '_')}_plan`,
        description: `Review and confirm ${catLower.replace(/-/g, ' ')} plan selection`,
        completed: isCompleted,
        completedAt: lastEnrollment ? lastEnrollment.updatedAt.toISOString() : null,
      };
    });

    const completedCount = requiredActions.filter((a) => a.completed).length;
    const completionPercentage =
      requiredActions.length > 0
        ? Math.round((completedCount / requiredActions.length) * 100)
        : 0;

    const lastActivity = employeeEnrollments.length > 0
      ? employeeEnrollments[0].updatedAt.toISOString()
      : null;

    // Build employee status
    const employeeStatus = {
      employeeId: employeeId || null,
      enrollmentComplete: completionPercentage === 100,
      requiredActions,
      completionPercentage,
      lastActivityAt: lastActivity,
    };

    // Build qualifying life events section
    const qualifyingLifeEvents = {
      eligible: qualifyingEvents.some((e) => e.allowsEnrollment),
      recentEvents: qualifyingEvents.map((event) => ({
        id: event.id,
        type: event.eventType.toLowerCase(),
        eventDate: event.eventDate.toISOString().split('T')[0],
        reportedDate: event.reportedDate.toISOString().split('T')[0],
        enrollmentDeadline: event.enrollmentDeadline?.toISOString().split('T')[0] ?? null,
        status: event.verifiedBy ? 'completed' : 'pending',
        description: event.description,
      })),
      allowedEventTypes: [
        'marriage',
        'divorce',
        'birth',
        'adoption',
        'loss_of_coverage',
        'relocation',
        'death',
        'employment_change',
      ],
    };

    // Build upcoming periods
    const upcomingPeriods = upcomingWindows.map((window) => ({
      id: window.id,
      name: window.windowName,
      type: window.windowType.toLowerCase().replace(/\s+/g, '_'),
      startDate: window.startDate.toISOString(),
      endDate: window.endDate.toISOString(),
      effectiveDate: window.startDate.toISOString(),
      description: window.description,
    }));

    const data = {
      currentPeriod,
      employeeStatus,
      qualifyingLifeEvents,
      upcomingPeriods,
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
    console.error('[Benefits Enrollment Status API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to fetch enrollment status',
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
