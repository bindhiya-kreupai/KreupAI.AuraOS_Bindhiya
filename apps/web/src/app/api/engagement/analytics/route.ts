import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { logger } from '@/lib/logger';

function getDefaultAnalytics(tenantId: string) {
  return {
    tenantId,
    overallEngagementScore: 0,
    activeSurveys: 0,
    surveyParticipationRate: 0,
    averageeSatisfaction: 0,
    eNPSScore: 0,
    upcomingEvents: 0,
    eventParticipationRate: 0,
    averageEventRating: 0,
    socialPosts: 0,
    socialEngagementRate: 0,
    activeIdeas: 0,
    implementedIdeas: 0,
    ideaImplementationRate: 0,
    csrParticipationRate: 0,
    volunteerHoursThisYear: 0,
    fundsRaisedThisYear: 0,
    recognitionsGiven: 0,
    recognitionsReceived: 0,
    lastUpdated: new Date().toISOString(),
  };
}

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.ENGAGEMENT, Action.READ, permissions);
      if (permissionError) return permissionError;

      try {
        const [recognitionCount, totalPoints] = await Promise.all([
          prisma.recognition.count({ where: { tenantId: user.tenantId } }),
          prisma.recognition.aggregate({
            where: { tenantId: user.tenantId },
            _sum: { points: true },
          }),
        ]);

        const analytics = {
          ...getDefaultAnalytics(user.tenantId),
          socialPosts: recognitionCount,
          recognitionsGiven: recognitionCount,
          totalRecognitionPoints: totalPoints._sum.points || 0,
        };

        return NextResponse.json({ success: true, data: analytics });
      } catch {
        return NextResponse.json({ success: true, data: getDefaultAnalytics(user.tenantId) });
      }
    } catch (error: any) {
      logger.error('Error fetching analytics:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 });
    }
  }
);
