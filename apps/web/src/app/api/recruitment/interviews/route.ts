import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';

/**
 * GET /api/recruitment/interviews
 * Fetch all scheduled interviews
 */
export const GET = withEnhancedAuth(async (request: NextRequest, _context) => {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');
    const status = searchParams.get('status');

    const interviews = await prisma.interview.findMany({
      where: {
        ...(applicationId && { applicationId }),
        ...(status && { status }),
      },
      include: {
        application: {
          include: {
            candidate: true,
            jobPosting: {
              select: {
                title: true,
                department: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledDate: 'asc' },
    });

    // Transform to match UI expectations
    const transformedInterviews = interviews.map((interview) => ({
      id: interview.id,
      applicationId: interview.applicationId,
      candidateId: interview.application.candidateId,
      candidateName: `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}`,
      candidateEmail: interview.application.candidate.email,
      jobTitle: interview.application.jobPosting.title,
      department: interview.application.jobPosting.department,
      title: interview.title,
      type: interview.type,
      scheduledDate: interview.scheduledDate.toISOString(),
      duration: interview.duration,
      location: interview.location,
      meetingLink: interview.meetingLink,
      interviewerIds: interview.interviewerIds,
      interviewerNames: interview.interviewerNames,
      status: interview.status,
      feedbackSubmitted: interview.feedbackSubmitted,
      overallRating: interview.overallRating,
      notes: interview.notes,
      createdAt: interview.createdAt.toISOString(),
      updatedAt: interview.updatedAt.toISOString(),
    }));

    return NextResponse.json({ data: transformedInterviews }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch interviews' }, { status: 500 });
  }
});

/**
 * POST /api/recruitment/interviews
 * Schedule a new interview
 */
export const POST = withEnhancedAuth(async (request: NextRequest, _context) => {
  try {
    const body = await request.json();

    const interview = await prisma.interview.create({
      data: {
        applicationId: body.applicationId,
        title: body.title,
        type: body.type,
        scheduledDate: new Date(body.scheduledDate),
        duration: body.duration,
        location: body.location,
        meetingLink: body.meetingLink,
        interviewerIds: body.interviewerIds,
        interviewerNames: body.interviewerNames,
        status: body.status || 'scheduled',
        notes: body.notes,
      },
      include: {
        application: {
          include: {
            candidate: true,
            jobPosting: true,
          },
        },
      },
    });

    return NextResponse.json({ data: interview }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create interview' }, { status: 500 });
  }
});

/**
 * PUT /api/recruitment/interviews/:id
 * Update interview details or status
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, _context) => {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Interview ID required' }, { status: 400 });
    }

    const interview = await prisma.interview.update({
      where: { id },
      data: {
        ...(updates.title && { title: updates.title }),
        ...(updates.type && { type: updates.type }),
        ...(updates.scheduledDate && { scheduledDate: new Date(updates.scheduledDate) }),
        ...(updates.duration !== undefined && { duration: updates.duration }),
        ...(updates.location !== undefined && { location: updates.location }),
        ...(updates.meetingLink !== undefined && { meetingLink: updates.meetingLink }),
        ...(updates.interviewerIds && { interviewerIds: updates.interviewerIds }),
        ...(updates.interviewerNames && { interviewerNames: updates.interviewerNames }),
        ...(updates.status && { status: updates.status }),
        ...(updates.feedbackSubmitted !== undefined && {
          feedbackSubmitted: updates.feedbackSubmitted,
        }),
        ...(updates.overallRating !== undefined && { overallRating: updates.overallRating }),
        ...(updates.notes !== undefined && { notes: updates.notes }),
      },
      include: {
        application: {
          include: {
            candidate: true,
            jobPosting: true,
          },
        },
      },
    });

    return NextResponse.json({ data: interview }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to update interview' }, { status: 500 });
  }
});
