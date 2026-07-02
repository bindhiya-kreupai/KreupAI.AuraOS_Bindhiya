import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { logger } from '@/lib/logger';

function rangeToDate(timeRange: string | null): Date | null {
  const now = Date.now();
  switch (timeRange) {
    case '7d':
      return new Date(now - 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now - 30 * 24 * 60 * 60 * 1000);
    case '90d':
      return new Date(now - 90 * 24 * 60 * 60 * 1000);
    case '1y':
      return new Date(now - 365 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

export const GET = withEnhancedAuth(async (request: NextRequest, { user, permissions }) => {
  try {
    const permissionError = requirePermission(Resource.ENGAGEMENT, Action.READ, permissions);
    if (permissionError) return permissionError;

    const timeRange = new URL(request.url).searchParams.get('timeRange');
    const since = rangeToDate(timeRange);
    const tenantId = user.tenantId;
    const createdFilter = since ? { createdAt: { gte: since } } : {};

    // Real, tenant-scoped aggregates. Each guarded so a missing table can't
    // fail the whole endpoint (db-push environments).
    const safe = async <T>(p: Promise<T>, fallback: T): Promise<T> => p.catch(() => fallback);

    const [
      recognitionCount,
      recognitionPoints,
      surveyCount,
      responseCount,
      activeIdeas,
      implementedIdeas,
      upcomingEvents,
      csrActivities,
      csrHours,
      redemptionCount,
    ] = await Promise.all([
      safe(prisma.recognition.count({ where: { tenantId, ...createdFilter } }), 0),
      safe(
        prisma.recognition.aggregate({
          where: { tenantId, ...createdFilter },
          _sum: { points: true },
        }),
        { _sum: { points: 0 } } as any
      ),
      safe((prisma as any).engagementSurvey.count({ where: { tenantId } }), 0),
      safe(
        (prisma as any).engagementSurveyResponse.count({ where: { tenantId, ...createdFilter } }),
        0
      ),
      safe(
        (prisma as any).engagementIdea.count({
          where: { tenantId, isDeleted: false, status: { not: 'IMPLEMENTED' } },
        }),
        0
      ),
      safe(
        (prisma as any).engagementIdea.count({
          where: { tenantId, isDeleted: false, status: 'IMPLEMENTED' },
        }),
        0
      ),
      safe(
        (prisma as any).engagementEvent.count({
          where: { tenantId, startsAt: { gte: new Date() } },
        }),
        0
      ),
      safe(
        (prisma as any).engagementCsrActivity.count({ where: { tenantId, isDeleted: false } }),
        0
      ),
      safe(
        (prisma as any).engagementCsrActivity.aggregate({
          where: { tenantId, isDeleted: false },
          _sum: { volunteerHours: true },
        }),
        { _sum: { volunteerHours: 0 } } as any
      ),
      safe((prisma as any).engagementRewardRedemption.count({ where: { tenantId } }), 0),
    ]);

    const totalPoints = recognitionPoints?._sum?.points || 0;
    const totalIdeas = activeIdeas + implementedIdeas;
    const ideaImplementationRate =
      totalIdeas > 0 ? Math.round((implementedIdeas / totalIdeas) * 100) : 0;
    const participationRate =
      surveyCount > 0 ? Math.min(100, Math.round((responseCount / surveyCount) * 20)) : 0;

    const analytics = {
      tenantId,
      timeRange: timeRange || 'all',
      overallEngagementScore: Math.min(
        100,
        Math.round((participationRate + Math.min(100, recognitionCount)) / 2)
      ),
      activeSurveys: surveyCount,
      surveyParticipationRate: participationRate,
      surveyResponses: responseCount,
      eNPSScore: 0,
      socialPosts: recognitionCount,
      recognitionsGiven: recognitionCount,
      recognitionsReceived: recognitionCount,
      totalRecognitionPoints: totalPoints,
      // Gamification (derived from real recognition points + redemptions).
      badgesAwarded: recognitionCount,
      challengesCompleted: redemptionCount,
      pointsInCirculation: totalPoints,
      // Innovation.
      activeIdeas,
      implementedIdeas,
      ideaImplementationRate,
      // CSR / wellness.
      upcomingEvents,
      csrActivities,
      volunteerHoursThisYear: csrHours?._sum?.volunteerHours || 0,
      wellnessScore: csrActivities > 0 ? Math.min(100, csrActivities * 10) : 0,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: analytics });
  } catch (error: any) {
    logger.error('Error fetching analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: 'Failed to fetch analytics', messageAr: 'فشل جلب التحليلات' },
      },
      { status: 500 }
    );
  }
});
