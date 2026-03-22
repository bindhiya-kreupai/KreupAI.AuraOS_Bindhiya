import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/recruitment/interviews/schedule
 * Get interviewer availability and upcoming scheduled interviews
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { searchParams } = new URL(request.url);
    const interviewerId = searchParams.get('interviewerId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: Record<string, unknown> = {
      status: { in: ['scheduled', 'SCHEDULED'] },
    };

    if (interviewerId) {
      where.interviewerIds = { has: interviewerId };
    }

    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) (where.scheduledDate as Record<string, unknown>).gte = new Date(startDate);
      if (endDate) (where.scheduledDate as Record<string, unknown>).lte = new Date(endDate);
    }

    const interviews = await prisma.interview.findMany({
      where,
      orderBy: { scheduledDate: 'asc' },
      take: 50,
      select: {
        id: true,
        title: true,
        scheduledDate: true,
        duration: true,
        type: true,
        location: true,
        meetingLink: true,
        interviewerIds: true,
        interviewerNames: true,
        status: true,
        application: {
          select: {
            candidate: { select: { id: true, firstName: true, lastName: true } },
            jobPosting: { select: { id: true, title: true } },
          },
        },
      },
    });

    // Build time slots (busy blocks)
    const busySlots = interviews.map(i => ({
      interviewId: i.id,
      start: i.scheduledDate,
      end: new Date(i.scheduledDate.getTime() + i.duration * 60 * 1000),
      interviewerIds: i.interviewerIds,
    }));

    return NextResponse.json({
      success: true,
      data: {
        interviews,
        busySlots,
        totalScheduled: interviews.length,
      },
      meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
    });
  } catch (error) {
    console.error('[Interview Schedule API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch interview schedule' } },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/recruitment/interviews/schedule
 * Schedule an interview (alias for POST /interviews)
 */
export const POST = withAudit(withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const body = await request.json();

    if (!body.applicationId || !body.scheduledDate || !body.type) {
      return NextResponse.json(
        { success: false, error: { code: 'E2001', message: 'applicationId, scheduledDate and type are required' } },
        { status: 400 }
      );
    }

    const application = await prisma.candidateApplication.findUnique({
      where: { id: body.applicationId },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Application not found' } },
        { status: 404 }
      );
    }

    const interview = await prisma.interview.create({
      data: {
        applicationId: body.applicationId,
        title: body.title || `${body.type} Interview`,
        scheduledDate: new Date(body.scheduledDate),
        duration: body.duration || 60,
        type: body.type,
        interviewerIds: body.interviewerIds || [user.id],
        interviewerNames: body.interviewerNames || [],
        location: body.location || null,
        meetingLink: body.meetingLink || null,
        notes: body.notes || null,
        status: 'scheduled',
      },
      include: {
        application: {
          include: {
            candidate: { select: { firstName: true, lastName: true, email: true } },
            jobPosting: { select: { title: true } },
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: interview,
        message: 'Interview scheduled successfully',
        meta: { timestamp: new Date().toISOString(), requestId: crypto.randomUUID(), apiVersion: 'v1' },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Interview Schedule API] POST Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to schedule interview' } },
      { status: 500 }
    );
  }
}), {
  action: AuditAction.EMPLOYEE_CREATED,
  resourceType: 'interview',
  captureRequestBody: true,
});
