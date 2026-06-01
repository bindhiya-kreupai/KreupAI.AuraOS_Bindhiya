import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * PUT /api/v1/learning/enrollments/[id]/progress
 * Update progress for a course enrollment
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  const { permissions } = context;
  if (!permissions.includes('learning/enrollments:update')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing learning/enrollments:update permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const { _user } = context;
    const { id } = context.params;
    const body = await request.json();

    if (body.progress === undefined || body.progress === null) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'progress (0-100) is required' } },
        { status: 400 }
      );
    }

    const progress = Math.max(0, Math.min(100, Number(body.progress)));

    const enrollment = await prisma.courseEnrollment.findUnique({ where: { id } });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Enrollment not found' } },
        { status: 404 }
      );
    }

    if (enrollment.status === 'COMPLETED' && progress < 100) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E4003', message: 'Cannot reduce progress for a completed course' },
        },
        { status: 422 }
      );
    }

    const isCompleted = progress === 100;

    const updated = await prisma.courseEnrollment.update({
      where: { id },
      data: {
        progress,
        status: isCompleted ? 'COMPLETED' : 'IN_PROGRESS',
        completedAt: isCompleted ? new Date() : enrollment.completedAt,
        lastAccessedAt: new Date(),
        // Update the current module/lesson if provided
        currentModuleId: body.currentModuleId || enrollment.currentModuleId,
        currentLessonId: body.currentLessonId || enrollment.currentLessonId,
        timeSpentMinutes: (enrollment.timeSpentMinutes || 0) + (body.timeSpentMinutes || 0),
      },
      include: {
        course: { select: { id: true, title: true } },
      },
    });

    // If completed, trigger certificate generation if course has certificate
    let certificate = null;
    if (isCompleted && !enrollment.completedAt) {
      try {
        const course = await prisma.course.findUnique({ where: { id: enrollment.courseId } });
        if (course?.hasCertificate) {
          certificate = await prisma.courseCertificate.create({
            data: {
              enrollmentId: id,
              courseId: enrollment.courseId,
              employeeId: enrollment.employeeId,
              issuedAt: new Date(),
              certificateNumber: `CERT-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
              expiresAt: course.certificateValidityDays
                ? new Date(Date.now() + course.certificateValidityDays * 24 * 60 * 60 * 1000)
                : null,
            },
          });
        }
      } catch {}
    }

    return NextResponse.json({
      success: true,
      data: {
        enrollment: updated,
        certificate,
        isCompleted,
      },
      message: isCompleted
        ? `Congratulations! ${updated.course.title} completed!`
        : 'Progress updated',
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    console.error('[Learning Progress API] PUT Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to update progress' } },
      { status: 500 }
    );
  }
});
