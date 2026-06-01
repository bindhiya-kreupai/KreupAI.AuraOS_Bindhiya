import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/recruitment/interviews
 * List interviews with pagination and filters
 */
export const GET = withEnhancedAuth(async (request: NextRequest, _context: any) => {
  try {
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
    if (interviewerId) where.interviewerIds = { has: interviewerId };
    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) (where.scheduledDate as Record<string, unknown>).gte = new Date(startDate);
      if (endDate) (where.scheduledDate as Record<string, unknown>).lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      prisma.interview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledDate: 'asc' },
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
  } catch (error) {
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
export const POST = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    try {
      const { user, permissions } = context;
      if (!permissions.includes('recruitment:create')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'E4030',
              message: 'Forbidden: missing recruitment:create permission',
              messageAr: 'ممنوع',
            },
          },
          { status: 403 }
        );
      }
      const body = await request.json();

      if (!body.applicationId || !body.scheduledDate || !body.type) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'E2001', message: 'applicationId, scheduledDate and type are required' },
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
          title: body.title || `${body.type} Interview`,
          scheduledDate: new Date(body.scheduledDate),
          duration: body.duration || body.durationMinutes || 60,
          type: body.type,
          interviewerIds: body.interviewerIds || body.interviewers || [user.id],
          interviewerNames: body.interviewerNames || [],
          location: body.location || null,
          meetingLink: body.meetingLink || body.meetingUrl || null,
          notes: body.notes || body.instructions || null,
          status: 'scheduled',
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
    } catch (error) {
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
  }),
  {
    action: AuditAction.EMPLOYEE_CREATED,
    resourceType: 'interview',
    captureRequestBody: true,
  }
);
