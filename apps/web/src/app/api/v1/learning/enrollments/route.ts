import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/learning/enrollments
 * List course enrollments with pagination and filters
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('learning/enrollments:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing learning/enrollments:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const employeeId = searchParams.get('employeeId') || user.employeeId;
    const courseId = searchParams.get('courseId') || undefined;
    const status = searchParams.get('status') || undefined;

    const where: Record<string, unknown> = {};
    if (employeeId) where.employeeId = employeeId;
    if (courseId) where.courseId = courseId;
    if (status) where.status = status;

    const [data, total] = await Promise.all([
      prisma.courseEnrollment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { enrolledAt: 'desc' },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              category: true,
              level: true,
              durationHours: true,
              thumbnailUrl: true,
            },
          },
        },
      }),
      prisma.courseEnrollment.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      meta: {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error) {
    console.error('[Learning Enrollments API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch enrollments' } },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/learning/enrollments
 * Enroll in a course
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('learning/enrollments:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing learning/enrollments:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();

    if (!body.courseId) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'courseId is required' } },
        { status: 400 }
      );
    }

    const employeeId = body.employeeId || user.employeeId;

    // Check if already enrolled
    const existing = await prisma.courseEnrollment.findFirst({
      where: { courseId: body.courseId, employeeId, status: { notIn: ['DROPPED', 'EXPIRED'] } },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: { code: 'E3002', message: 'Already enrolled in this course' } },
        { status: 409 }
      );
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: body.courseId },
    });

    if (!course || course.status !== 'PUBLISHED') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E4001', message: 'Course not found or not available for enrollment' },
        },
        { status: 404 }
      );
    }

    const enrollment = await prisma.courseEnrollment.create({
      data: {
        courseId: body.courseId,
        employeeId,
        enrolledAt: new Date(),
        enrolledBy: user.id,
        status: 'IN_PROGRESS',
        progress: 0,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        source: body.source || 'SELF', // SELF, MANAGER, ADMIN, MANDATORY
      },
      include: {
        course: { select: { id: true, title: true, category: true, level: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: enrollment,
        message: `Successfully enrolled in ${course.title}`,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Learning Enrollments API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to enroll in course',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
      },
      { status: 500 }
    );
  }
});
