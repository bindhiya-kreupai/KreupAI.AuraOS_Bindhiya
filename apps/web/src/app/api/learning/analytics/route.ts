import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { logger } from '@/lib/logger';

export const GET = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEARNING, Action.READ, permissions);
      if (permissionError) return permissionError;

      const tenantId = user.tenantId;

      const [
        totalCourses,
        activeCourses,
        totalCourseEnrollments,
        completedCourseEnrollments,
        totalPathEnrollments,
        completedPathEnrollments,
        totalAssessments,
        totalCertifications,
        avgScoreResult,
        topCoursesRaw,
      ] = await Promise.all([
        prisma.course.count({ where: { tenantId } }),
        prisma.course.count({ where: { tenantId, status: 'published' } }),
        prisma.courseEnrollment.count({ where: { tenantId } }),
        prisma.courseEnrollment.count({ where: { tenantId, status: 'completed' } }),
        prisma.learningPathEnrollment.count({ where: { tenantId } }),
        prisma.learningPathEnrollment.count({ where: { tenantId, status: 'COMPLETED' } }),
        prisma.assessment.count({ where: { tenantId } }),
        prisma.certification.count({ where: { tenantId } }),
        prisma.courseEnrollment.aggregate({
          where: { tenantId, score: { not: null } },
          _avg: { score: true },
        }),
        prisma.course.findMany({
          where: { tenantId, status: 'published' },
          orderBy: { enrollmentCount: 'desc' },
          take: 5,
          select: { id: true, title: true, enrollmentCount: true, completionRate: true, rating: true },
        }),
      ]);

      const totalEnrollments = totalCourseEnrollments + totalPathEnrollments;
      const completedEnrollments = completedCourseEnrollments + completedPathEnrollments;
      const activeEnrollments = totalEnrollments - completedEnrollments;
      const averageCompletionRate = totalEnrollments > 0
        ? Math.round((completedEnrollments / totalEnrollments) * 1000) / 10
        : 0;
      const averageScore = avgScoreResult._avg.score
        ? Math.round(avgScoreResult._avg.score * 10) / 10
        : 0;

      const topCourses = topCoursesRaw.map((c) => ({
        courseId: c.id,
        courseTitle: c.title,
        enrollments: c.enrollmentCount,
        completionRate: c.completionRate || 0,
        averageRating: c.rating || 0,
      }));

      const analytics = {
        totalCourses,
        activeCourses,
        totalEnrollments,
        activeEnrollments,
        completedEnrollments,
        averageCompletionRate,
        averageScore,
        totalCertificationsIssued: totalCertifications,
        totalTrainingHours: 0,
        trainingBudgetUtilization: 0,
        topCourses,
        enrollmentsByCategory: {},
        completionTrend: [],
      };

      return NextResponse.json({ success: true, data: analytics });
    } catch (error: any) {
      logger.error('Error fetching analytics:', error);
      return NextResponse.json({
        success: true,
        data: {
          totalCourses: 0,
          activeCourses: 0,
          totalEnrollments: 0,
          activeEnrollments: 0,
          completedEnrollments: 0,
          averageCompletionRate: 0,
          averageScore: 0,
          totalCertificationsIssued: 0,
          totalTrainingHours: 0,
          trainingBudgetUtilization: 0,
          topCourses: [],
          enrollmentsByCategory: {},
          completionTrend: [],
        },
      });
    }
  }
);
