import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/recruitment/interviews/[id]
 * Get a single interview by ID
 */
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  const { permissions } = context;
  if (!permissions.includes('recruitment:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing recruitment:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const id = context.params?.id;

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
            jobPosting: { select: { id: true, title: true, department: true } },
          },
        },
        feedback: true,
      },
    });

    if (!interview) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Interview not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: interview,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[Interviews API] GET [id] Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch interview' } },
      { status: 500 }
    );
  }
});

/**
 * PUT /api/v1/recruitment/interviews/[id]
 * Update an interview (reschedule, cancel, complete, update details)
 */
export const PUT = withAudit(
  withEnhancedAuth(async (request: NextRequest, context: any) => {
    const { permissions } = context;
    if (!permissions.includes('recruitment:update')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing recruitment:update permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    try {
      const id = context.params?.id;

      if (!id) {
        return NextResponse.json(
          { success: false, error: { code: 'E2001', message: 'Interview ID is required' } },
          { status: 400 }
        );
      }

      const existing = await prisma.interview.findUnique({ where: { id } });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: { code: 'E4001', message: 'Interview not found' } },
          { status: 404 }
        );
      }

      const body = await request.json();

      const updateData: Record<string, unknown> = {};
      if (body.scheduledDate !== undefined) updateData.scheduledDate = new Date(body.scheduledDate);
      if (body.duration !== undefined) updateData.duration = body.duration;
      if (body.durationMinutes !== undefined) updateData.duration = body.durationMinutes;
      if (body.type !== undefined) updateData.type = body.type;
      if (body.status !== undefined) updateData.status = body.status;
      if (body.title !== undefined) updateData.title = body.title;
      if (body.location !== undefined) updateData.location = body.location;
      if (body.meetingLink !== undefined) updateData.meetingLink = body.meetingLink;
      if (body.meetingUrl !== undefined) updateData.meetingLink = body.meetingUrl;
      if (body.notes !== undefined) updateData.notes = body.notes;
      if (body.instructions !== undefined) updateData.notes = body.instructions;
      if (body.interviewerIds !== undefined) updateData.interviewerIds = body.interviewerIds;
      if (body.interviewers !== undefined) updateData.interviewerIds = body.interviewers;
      if (body.interviewerNames !== undefined) updateData.interviewerNames = body.interviewerNames;
      if (body.overallRating !== undefined) updateData.overallRating = body.overallRating;
      if (body.outcome !== undefined) updateData.outcome = body.outcome;

      const updated = await prisma.interview.update({
        where: { id },
        data: updateData,
        include: {
          application: {
            include: {
              candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
              jobPosting: { select: { id: true, title: true } },
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Interview updated successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      });
    } catch (error: any) {
      console.error('[Interviews API] PUT [id] Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'E5001', message: 'Failed to update interview' } },
        { status: 500 }
      );
    }
  }),
  {
    action: AuditAction.EMPLOYEE_UPDATED,
    resourceType: 'interview',
    captureRequestBody: true,
  }
);
