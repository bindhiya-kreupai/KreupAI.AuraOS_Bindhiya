import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/recruitment/interviews
 * List interviews with pagination and filters
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { _user } = context;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const status = searchParams.get('status') || undefined;
    const interviewerId = searchParams.get('interviewerId') || undefined;
    const applicationId = searchParams.get('applicationId') || undefined;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (applicationId) where.applicationId = applicationId;
    if (interviewerId) where.interviewers = { has: interviewerId };
    if (startDate || endDate) {
      where.scheduledAt = {};
      if (startDate) (where.scheduledAt as Record<string, unknown>).gte = new Date(startDate);
      if (endDate) (where.scheduledAt as Record<string, unknown>).lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      prisma.interview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledAt: 'asc' },
        include: {
          application: {
            include: {
              candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
              jobPosting: { select: { id: true, title: true } },
            },
          },
        },
      }),
      prisma.interview.count({ where }),
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
    console.error('[Interviews API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch interviews' } },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/recruitment/interviews
 * Schedule a new interview
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();

    if (!body.applicationId || !body.scheduledAt || !body.interviewType) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: 'applicationId, scheduledAt and interviewType are required',
          },
        },
        { status: 400 }
      );
    }

    const application = await prisma.candidateApplication.findUnique({
      where: { id: body.applicationId },
      include: { candidate: true, jobPosting: true },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Candidate application not found' } },
        { status: 404 }
      );
    }

    const interview = await prisma.interview.create({
      data: {
        applicationId: body.applicationId,
        scheduledAt: new Date(body.scheduledAt),
        durationMinutes: body.durationMinutes || 60,
        interviewType: body.interviewType,
        format: body.format || 'VIDEO', // VIDEO, IN_PERSON, PHONE
        interviewers: body.interviewers || [user.id],
        location: body.location || null,
        meetingUrl: body.meetingUrl || null,
        instructions: body.instructions || null,
        status: 'SCHEDULED',
        scheduledBy: user.id,
      },
      include: {
        application: {
          include: {
            candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
            jobPosting: { select: { id: true, title: true } },
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: interview,
        message: 'Interview scheduled successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 201 }
    );
  } catch (_error) {
    console.error('[Interviews API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to schedule interview',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
      },
      { status: 500 }
    );
  }
});
