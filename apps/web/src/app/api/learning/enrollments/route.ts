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

      const { searchParams } = new URL(request.url);
      const learnerId = searchParams.get('learnerId') || user.userId;
      const status = searchParams.get('status');
      const courseId = searchParams.get('courseId');

      const courseWhere: Record<string, unknown> = {
        tenantId: user.tenantId,
        employeeId: learnerId,
      };
      if (status) courseWhere.status = status;
      if (courseId) courseWhere.courseId = courseId;

      const [courseEnrollments, pathEnrollments] = await Promise.all([
        prisma.courseEnrollment.findMany({
          where: courseWhere,
          include: { course: { select: { title: true, category: true } } },
          orderBy: { enrolledAt: 'desc' },
        }),
        prisma.learningPathEnrollment.findMany({
          where: {
            tenantId: user.tenantId,
            employeeId: learnerId,
            ...(status ? { status: status.toUpperCase() } : {}),
          },
          include: { path: { select: { title: true } } },
          orderBy: { enrolledAt: 'desc' },
        }),
      ]);

      const combined = [
        ...courseEnrollments.map((e) => ({
          id: e.id,
          courseId: e.courseId,
          courseName: e.course.title,
          learnerId: e.employeeId,
          status: e.status,
          progress: e.progress,
          score: e.score,
          startDate: e.startedAt?.toISOString(),
          completedDate: e.completedAt?.toISOString(),
          enrolledDate: e.enrolledAt.toISOString(),
          type: 'course',
        })),
        ...pathEnrollments.map((e) => ({
          id: e.id,
          learningPathId: e.pathId,
          courseName: e.path.title,
          learnerId: e.employeeId,
          status: e.status.toLowerCase(),
          progress: e.progress,
          completedDate: e.completedAt?.toISOString(),
          enrolledDate: e.enrolledAt.toISOString(),
          type: 'path',
        })),
      ];

      return NextResponse.json({ success: true, data: combined });
    } catch (error: any) {
      logger.error('Error fetching enrollments:', error);
      return NextResponse.json({ success: true, data: [] });
    }
  }
);

export const POST = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEARNING, Action.CREATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();

      if (body.learningPathId) {
        const enrollment = await prisma.learningPathEnrollment.create({
          data: {
            tenantId: user.tenantId,
            pathId: body.learningPathId,
            employeeId: body.learnerId || user.userId,
            status: 'ENROLLED',
            progress: 0,
          },
        });
        return NextResponse.json({ success: true, data: enrollment }, { status: 201 });
      }

      const enrollment = await prisma.courseEnrollment.create({
        data: {
          courseId: body.courseId,
          employeeId: body.learnerId || user.userId,
          tenantId: user.tenantId,
          status: 'enrolled',
          progress: 0,
        },
        include: { course: { select: { title: true } } },
      });

      await prisma.course.update({
        where: { id: body.courseId },
        data: { enrollmentCount: { increment: 1 } },
      });

      logger.info('Enrollment created:', enrollment.id);
      return NextResponse.json({ success: true, data: enrollment }, { status: 201 });
    } catch (error: any) {
      logger.error('Error creating enrollment:', error);
      return NextResponse.json({ success: false, error: 'Failed to create enrollment' }, { status: 500 });
    }
  }
);

export const PUT = withEnhancedAuth(
  async (request: NextRequest, { user, permissions }) => {
    try {
      const permissionError = requirePermission(Resource.LEARNING, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const body = await request.json();
      const { id, ...updates } = body;

      if (!id) {
        return NextResponse.json({ success: false, error: 'Enrollment ID is required' }, { status: 400 });
      }

      const enrollment = await prisma.courseEnrollment.update({
        where: { id },
        data: {
          ...(updates.status !== undefined && { status: updates.status }),
          ...(updates.progress !== undefined && { progress: updates.progress }),
          ...(updates.score !== undefined && { score: updates.score }),
          ...(updates.status === 'in_progress' && !updates.startedAt && { startedAt: new Date() }),
          ...(updates.status === 'completed' && { completedAt: new Date() }),
        },
      });

      return NextResponse.json({ success: true, data: enrollment });
    } catch (error: any) {
      logger.error('Error updating enrollment:', error);
      return NextResponse.json({ success: false, error: 'Failed to update enrollment' }, { status: 500 });
    }
  }
);
