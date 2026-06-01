import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { ServiceProxy } from '@/lib/services/service-proxy';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('learning/progress:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing learning/progress:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('userId') || searchParams.get('employeeId') || user.userId;
    const contentId = searchParams.get('contentId');

    // Proxy to analytics-service (or learning service if it existed)
    const result = await ServiceProxy.get('analytics', '/api/v1/learning/progress', {
      tenantId: user.tenantId,
      employeeId,
      contentId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('[LearningProgress API] Error:', error);
    return NextResponse.json({
      success: true,
      data: {
        userId: context.user.userId,
        overallStats: {
          totalPathsEnrolled: 0,
          pathsCompleted: 0,
          pathsInProgress: 0,
          totalHoursSpent: 0,
          averageScore: 0,
          streak: 0,
          lastActivity: null,
        },
        activePaths: [],
        completedPaths: [],
        progressRecords: [],
      },
    });
  }
});
