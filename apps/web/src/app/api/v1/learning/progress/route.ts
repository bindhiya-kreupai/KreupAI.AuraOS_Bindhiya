import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const GET = withEnhancedAuth(
  async (request: NextRequest, context) => {
    try {
      const { user } = context;
      const { searchParams } = new URL(request.url);
      const employeeId = searchParams.get('userId') || searchParams.get('employeeId') || user.userId;
      const contentId = searchParams.get('contentId');

      const where: Record<string, unknown> = {
        tenantId: user.tenantId,
        employeeId,
      };
      if (contentId) where.contentId = contentId;

      const progressRecords = await prisma.learningProgress.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
      });

      const pathEnrollments = await prisma.learningPathEnrollment.findMany({
        where: { tenantId: user.tenantId, employeeId },
        include: { path: { select: { title: true, modules: true } } },
      });

      const activePaths = pathEnrollments
        .filter((e) => e.status !== 'COMPLETED' && e.status !== 'DROPPED')
        .map((e) => ({
          pathId: e.pathId,
          title: e.path.title,
          progress: e.progress,
          lastAccessed: e.enrolledAt.toISOString(),
        }));

      const completedPaths = pathEnrollments
        .filter((e) => e.status === 'COMPLETED')
        .map((e) => ({
          pathId: e.pathId,
          title: e.path.title,
          completedAt: e.completedAt?.toISOString(),
        }));

      const totalHoursSpent = progressRecords.reduce((sum, r) => sum + r.timeSpent, 0) / 3600;

      const progress = {
        userId: employeeId,
        overallStats: {
          totalPathsEnrolled: pathEnrollments.length,
          pathsCompleted: completedPaths.length,
          pathsInProgress: activePaths.length,
          totalHoursSpent: Math.round(totalHoursSpent * 10) / 10,
          averageScore: 0,
          streak: 0,
          lastActivity: progressRecords[0]?.updatedAt?.toISOString() || null,
        },
        activePaths,
        completedPaths,
        progressRecords: progressRecords.map((r) => ({
          id: r.id,
          contentId: r.contentId,
          contentType: r.contentType,
          progress: r.progress,
          timeSpent: r.timeSpent,
          completedAt: r.completedAt?.toISOString(),
        })),
      };

      return NextResponse.json({ success: true, data: progress });
    } catch (error) {
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
  }
);
