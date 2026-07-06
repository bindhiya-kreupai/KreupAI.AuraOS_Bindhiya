import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { Resource, Action, requirePermission } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { logger } from '@/lib/logger';

// POST: mark attendance for one or many attendees on a training session.
export const POST = withEnhancedAuth<{ params?: { sessionId?: string } }>(
  async (request: NextRequest, context) => {
    try {
      const { user, permissions, params } = context;
      const permissionError = requirePermission(Resource.LEARNING, Action.UPDATE, permissions);
      if (permissionError) return permissionError;

      const sessionId = params?.sessionId;
      if (!sessionId) {
        return NextResponse.json(
          { success: false, message: 'Session ID is required', messageAr: 'معرف الجلسة مطلوب' },
          { status: 400 }
        );
      }

      const session = await prisma.trainingSession.findFirst({
        where: { id: sessionId, tenantId: user.tenantId },
      });
      if (!session) {
        return NextResponse.json(
          {
            success: false,
            message: 'Training session not found',
            messageAr: 'الجلسة التدريبية غير موجودة',
          },
          { status: 404 }
        );
      }

      const body = await request.json();
      // Support both single { learnerId, status } and bulk { attendees: [...] }.
      const entries: Array<{ learnerId: string; status: string }> = Array.isArray(body.attendees)
        ? body.attendees
        : body.learnerId
          ? [{ learnerId: body.learnerId, status: body.status || 'present' }]
          : [];

      if (entries.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: 'At least one attendee is required',
            messageAr: 'مطلوب حاضر واحد على الأقل',
          },
          { status: 400 }
        );
      }

      const results = await Promise.all(
        entries.map((entry) =>
          prisma.sessionAttendee.upsert({
            where: { sessionId_employeeId: { sessionId, employeeId: entry.learnerId } },
            create: {
              sessionId,
              employeeId: entry.learnerId,
              status: entry.status || 'present',
              checkedInAt: entry.status === 'present' ? new Date() : null,
            },
            update: {
              status: entry.status || 'present',
              checkedInAt: entry.status === 'present' ? new Date() : null,
              updatedBy: user.userId,
            },
          })
        )
      );

      logger.info(`Marked attendance for ${results.length} attendee(s) on session ${sessionId}`);
      return NextResponse.json({ success: true, data: results });
    } catch (error: unknown) {
      logger.error({ err: error }, 'Error marking attendance');
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to mark attendance',
          messageAr: 'فشل في تسجيل الحضور',
        },
        { status: 500 }
      );
    }
  }
);
