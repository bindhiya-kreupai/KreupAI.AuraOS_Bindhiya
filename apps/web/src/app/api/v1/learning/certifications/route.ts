import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/learning/certifications
 * Get certifications for the current user or specified employee
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('learning/certifications:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing learning/certifications:read permission',
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
    const status = searchParams.get('status') || undefined; // ACTIVE, EXPIRED, EXPIRING_SOON
    const courseId = searchParams.get('courseId') || undefined;

    const where: Record<string, unknown> = {};
    if (employeeId) where.employeeId = employeeId;
    if (courseId) where.courseId = courseId;

    // Handle status filter (EXPIRED, EXPIRING_SOON are computed)
    if (status === 'EXPIRED') {
      where.expiresAt = { lt: new Date() };
    } else if (status === 'EXPIRING_SOON') {
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      where.expiresAt = { gte: new Date(), lte: thirtyDaysFromNow };
    }

    const [data, total] = await Promise.all([
      prisma.courseCertificate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { issuedAt: 'desc' },
        include: {
          course: { select: { id: true, title: true, category: true } },
          enrollment: { select: { id: true, completedAt: true } },
        },
      }),
      prisma.courseCertificate.count({ where }),
    ]);

    const enriched = data.map((cert) => ({
      ...cert,
      isExpired: cert.expiresAt ? cert.expiresAt < new Date() : false,
      isExpiringSoon: cert.expiresAt
        ? cert.expiresAt >= new Date() &&
          cert.expiresAt <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : false,
    }));

    return NextResponse.json({
      success: true,
      data: enriched,
      meta: {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error) {
    console.error('[Learning Certifications API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch certifications' } },
      { status: 500 }
    );
  }
});
