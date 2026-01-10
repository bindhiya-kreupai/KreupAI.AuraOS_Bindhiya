import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEARNING, Action.READ, permissions);
      if (permissionError) return permissionError;

      const mockAnalytics = {
        totalCourses: 156,
        activeCourses: 89,
        totalEnrollments: 2340,
        activeEnrollments: 1205,
        completedEnrollments: 987,
        averageCompletionRate: 73.5,
        averageScore: 82.3,
        totalCertificationsIssued: 456,
        totalTrainingHours: 18540,
        trainingBudgetUtilization: 78.2,
        topCourses: [],
        enrollmentsByCategory: {},
        completionTrend: [],
      };

      return NextResponse.json({ success: true, data: mockAnalytics });
    } catch (error) {
      logger.error('Error fetching analytics:', error);
      return NextResponse.json({ success: false, error: 'Failed to fetch analytics' }, { status: 500 });
    }
  }
);
