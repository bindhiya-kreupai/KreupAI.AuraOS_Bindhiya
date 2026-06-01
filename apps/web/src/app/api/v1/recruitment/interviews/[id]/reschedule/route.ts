import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * PUT /api/v1/recruitment/interviews/[id]/reschedule
 * Reschedule an existing interview
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
      const { id } = await context.params;
      const body = await request.json();

      if (!body.scheduledDate) {
        return NextResponse.json(
          { success: false, error: { code: 'E2001', message: 'scheduledDate is required' } },
          { status: 400 }
        );
      }

      const interview = await prisma.interview.findUnique({ where: { id } });

      if (!interview) {
        return NextResponse.json(
          { success: false, error: { code: 'E4001', message: 'Interview not found' } },
          { status: 404 }
        );
      }

      if (['completed', 'cancelled'].includes(interview.status)) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'E4003', message: `Cannot reschedule a ${interview.status} interview` },
          },
          { status: 422 }
        );
      }

      const previousDate = interview.scheduledDate;

      const updated = await prisma.interview.update({
        where: { id },
        data: {
          scheduledDate: new Date(body.scheduledDate),
          duration: body.duration || interview.duration,
          location: body.location !== undefined ? body.location : interview.location,
          meetingLink: body.meetingLink !== undefined ? body.meetingLink : interview.meetingLink,
          notes: body.reason
            ? `${interview.notes ? interview.notes + '\n' : ''}Rescheduled: ${body.reason}`
            : interview.notes,
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

      return NextResponse.json({
        success: true,
        data: {
          ...updated,
          previousScheduledDate: previousDate,
        },
        message: 'Interview rescheduled successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      });
    } catch (error) {
      console.error('[Interview Reschedule API] PUT Error:', error);
      return NextResponse.json(
        { success: false, error: { code: 'E5001', message: 'Failed to reschedule interview' } },
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
