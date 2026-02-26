import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/recruitment/candidates
 * List candidates with pagination and filters
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { _user } = context;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const status = searchParams.get('status') || undefined;
    const jobPostingId = searchParams.get('jobPostingId') || undefined;
    const stage = searchParams.get('stage') || undefined;
    const search = searchParams.get('search') || undefined;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // If jobPostingId or stage filter, go through applications
    if (jobPostingId || stage) {
      const appWhere: Record<string, unknown> = {};
      if (jobPostingId) appWhere.jobPostingId = jobPostingId;
      if (stage) appWhere.currentStage = stage;

      const [applications, total] = await Promise.all([
        prisma.candidateApplication.findMany({
          where: appWhere,
          skip,
          take: limit,
          orderBy: { appliedAt: 'desc' },
          include: {
            candidate: true,
            jobPosting: { select: { id: true, title: true, department: true } },
          },
        }),
        prisma.candidateApplication.count({ where: appWhere }),
      ]);

      return NextResponse.json({
        success: true,
        data: applications,
        meta: {
          pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      });
    }

    const [data, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { applications: true } },
          applications: {
            select: { id: true, status: true, currentStage: true, jobPostingId: true },
            take: 1,
            orderBy: { appliedAt: 'desc' },
          },
        },
      }),
      prisma.candidate.count({ where }),
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
  } catch (_error) {
    console.error('[Recruitment Candidates API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch candidates' } },
      { status: 500 }
    );
  }
});
