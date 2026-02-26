import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/learning/compliance-training
 * Get compliance training assignments for current user or specified employee
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const employeeId = searchParams.get('employeeId') || user.employeeId;
    const status = searchParams.get('status') || undefined; // PENDING, COMPLETED, OVERDUE
    const dueBeforeDate = searchParams.get('dueBefore') || undefined;

    const where: Record<string, unknown> = {
      isMandatory: true,
      status: { notIn: ['DROPPED'] },
    };

    if (employeeId) where.employeeId = employeeId;
    if (status === 'OVERDUE') {
      where.dueDate = { lt: new Date() };
      where.status = { notIn: ['COMPLETED', 'DROPPED'] };
    } else if (status === 'PENDING') {
      where.status = { notIn: ['COMPLETED', 'DROPPED'] };
    } else if (status === 'COMPLETED') {
      where.status = 'COMPLETED';
    }
    if (dueBeforeDate) {
      where.dueDate = { lte: new Date(dueBeforeDate) };
    }

    const [data, total] = await Promise.all([
      prisma.courseEnrollment.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ dueDate: 'asc' }, { enrolledAt: 'desc' }],
        include: {
          course: {
            select: {
              id: true,
              title: true,
              category: true,
              level: true,
              durationHours: true,
              description: true,
              thumbnailUrl: true,
              isMandatory: true,
            },
          },
        },
      }),
      prisma.courseEnrollment.count({ where }),
    ]);

    const enriched = data.map((enrollment) => ({
      ...enrollment,
      isOverdue: enrollment.dueDate
        ? enrollment.dueDate < new Date() && enrollment.status !== 'COMPLETED'
        : false,
      daysUntilDue: enrollment.dueDate
        ? Math.ceil((enrollment.dueDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
        : null,
    }));

    const overdueCount = enriched.filter((e) => e.isOverdue).length;
    const completedCount = enriched.filter((e) => e.status === 'COMPLETED').length;
    const pendingCount = enriched.length - completedCount;

    return NextResponse.json({
      success: true,
      data: enriched,
      meta: {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        summary: { total, completed: completedCount, pending: pendingCount, overdue: overdueCount },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    console.error('[Compliance Training API] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: { code: 'E5001', message: 'Failed to fetch compliance training assignments' },
      },
      { status: 500 }
    );
  }
});
