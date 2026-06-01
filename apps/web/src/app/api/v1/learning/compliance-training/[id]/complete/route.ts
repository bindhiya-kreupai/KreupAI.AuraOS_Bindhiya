import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/learning/compliance-training/[id]/complete
 * Mark a compliance training as complete (manual completion for offline/external training)
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  const { permissions } = context;
  if (!permissions.includes('learning/compliance-training:create')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing learning/compliance-training:create permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const { _user } = context;
    const { id } = context.params; // enrollment ID
    const body = await request.json().catch(() => ({}));

    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, title: true, hasCertificate: true, isMandatory: true } },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Training enrollment not found' } },
        { status: 404 }
      );
    }

    if (!enrollment.course.isMandatory) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4003',
            message: 'This endpoint is only for compliance (mandatory) training',
          },
        },
        { status: 422 }
      );
    }

    if (enrollment.status === 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: { code: 'E4003', message: 'Training is already completed' } },
        { status: 422 }
      );
    }

    const completedAt = body.completedAt ? new Date(body.completedAt) : new Date();

    const updated = await prisma.courseEnrollment.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        progress: 100,
        completedAt,
        completionMethod: body.completionMethod || 'ONLINE', // ONLINE, OFFLINE, EXTERNAL
        completionNotes: body.notes || null,
        verifiedBy: body.verifiedBy || null,
        verifiedAt: body.verifiedBy ? new Date() : null,
        lastAccessedAt: new Date(),
      },
      include: {
        course: { select: { id: true, title: true, category: true } },
      },
    });

    // Issue certificate if course has one
    let certificate = null;
    if (enrollment.course.hasCertificate) {
      try {
        certificate = await prisma.courseCertificate.create({
          data: {
            enrollmentId: id,
            courseId: enrollment.courseId,
            employeeId: enrollment.employeeId,
            issuedAt: completedAt,
            certificateNumber: `CERT-COMP-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,
          },
        });
      } catch {}
    }

    return NextResponse.json({
      success: true,
      data: { enrollment: updated, certificate },
      message: `Compliance training "${enrollment.course.title}" marked as complete`,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[Compliance Training Complete API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'E5001', message: 'Failed to mark compliance training as complete' },
      },
      { status: 500 }
    );
  }
});
