import { NextRequest, NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

// ===== GET Handler =====
export const GET = withEnhancedAuth(async (request, context) => {
  try {
    const { user } = context;

    // Aggregate metrics from ExitRequest
    const [
      totalOffboarding,
      activeOffboarding,
      completedOffboarding,
      resignations,
      terminations,
      rehireEligible,
      rehireNotEligible,
    ] = await Promise.all([
      prisma.exitRequest.count({
        where: { tenantId: user.tenantId },
      }),
      prisma.exitRequest.count({
        where: {
          tenantId: user.tenantId,
          status: { in: ['PENDING', 'APPROVED', 'PROCESSING'] },
        },
      }),
      prisma.exitRequest.count({
        where: { tenantId: user.tenantId, status: 'COMPLETED' },
      }),
      prisma.exitRequest.count({
        where: { tenantId: user.tenantId, exitType: 'RESIGNATION' },
      }),
      prisma.exitRequest.count({
        where: { tenantId: user.tenantId, exitType: 'TERMINATION' },
      }),
      prisma.exitRequest.count({
        where: { tenantId: user.tenantId, rehireEligible: true },
      }),
      prisma.exitRequest.count({
        where: { tenantId: user.tenantId, rehireEligible: false },
      }),
    ]);

    // Compute average notice period
    const exitRequests = await prisma.exitRequest.findMany({
      where: { tenantId: user.tenantId },
      select: {
        noticePeriodDays: true,
        exitType: true,
        reason: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        clearanceStatus: true,
      },
    });

    const totalNoticeDays = exitRequests.reduce(
      (sum, r) => sum + r.noticePeriodDays,
      0
    );
    const averageNoticePeriod =
      exitRequests.length > 0
        ? Math.round(totalNoticeDays / exitRequests.length)
        : 0;

    // Average completion time (days between creation and last update for completed)
    const completedRequests = exitRequests.filter(
      (r) => r.status === 'COMPLETED'
    );
    const totalCompletionDays = completedRequests.reduce((sum, r) => {
      const diff =
        (r.updatedAt.getTime() - r.createdAt.getTime()) /
        (24 * 60 * 60 * 1000);
      return sum + diff;
    }, 0);
    const averageCompletionTime =
      completedRequests.length > 0
        ? Math.round(totalCompletionDays / completedRequests.length)
        : 0;

    // Top exit reasons
    const reasonCounts: Record<string, number> = {};
    exitRequests.forEach((r) => {
      const reason = r.reason || 'Not specified';
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });
    const topExitReasons = Object.entries(reasonCounts)
      .map(([reason, count]) => ({
        reason,
        count,
        percentage:
          exitRequests.length > 0
            ? Math.round((count / exitRequests.length) * 100)
            : 0,
        trend: 'stable' as const,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Offboarding by type
    const offboardingByType = [
      {
        type: 'resignation',
        count: resignations,
        percentage:
          totalOffboarding > 0
            ? Math.round((resignations / totalOffboarding) * 100)
            : 0,
      },
      {
        type: 'termination',
        count: terminations,
        percentage:
          totalOffboarding > 0
            ? Math.round((terminations / totalOffboarding) * 100)
            : 0,
      },
    ];

    // Clearance completion rate
    const clearanceCompleted = exitRequests.filter(
      (r) => r.clearanceStatus === 'COMPLETED'
    ).length;
    const clearanceCompletionRate =
      exitRequests.length > 0
        ? Math.round((clearanceCompleted / exitRequests.length) * 100)
        : 0;

    // Voluntary vs involuntary turnover
    const voluntaryTurnover =
      totalOffboarding > 0
        ? Math.round((resignations / totalOffboarding) * 100)
        : 0;
    const involuntaryTurnover =
      totalOffboarding > 0
        ? Math.round((terminations / totalOffboarding) * 100)
        : 0;

    const metrics = {
      totalOffboarding,
      activeOffboarding,
      completedOffboarding,
      averageCompletionTime,
      averageNoticePeriod,
      offboardingByType,
      offboardingByDepartment: [],
      turnoverRate: 0,
      voluntaryTurnover,
      involuntaryTurnover,
      retirementRate: 0,
      avgTenure: 0,
      topExitReasons,
      rehireEligibilityStats: {
        eligible: rehireEligible,
        notEligible: rehireNotEligible,
        restricted: 0,
        underReview: 0,
      },
      exitInterviewParticipation: 0,
      exitSurveyResponse: 0,
      averageExitRating: 0,
      npsScore: 0,
      equipmentReturnRate: 0,
      clearanceCompletionRate,
      knowledgeTransferCompletionRate: 0,
      alumniEngagementRate: 0,
      costPerOffboarding: 0,
      retentionRiskDepartments: [],
    };

    return NextResponse.json(
      { success: true, metrics },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching offboarding metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch offboarding metrics' },
      { status: 500 }
    );
  }
});
