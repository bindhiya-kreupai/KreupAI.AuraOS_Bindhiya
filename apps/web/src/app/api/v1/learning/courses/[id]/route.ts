import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/learning/courses/[id]
 * Get a specific course with full details
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('learning/courses:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing learning/courses:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { id } = context.params;

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: { orderBy: { sortOrder: 'asc' } },
          },
        },
        _count: { select: { enrollments: true } },
        enrollments: {
          where: { employeeId: user.employeeId },
          select: { id: true, status: true, progress: true, completedAt: true, enrolledAt: true },
          take: 1,
        },
      },
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Course not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...course,
        userEnrollment: course.enrollments[0] || null,
        enrollments: undefined,
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch course' } },
      { status: 500 }
    );
  }
});
