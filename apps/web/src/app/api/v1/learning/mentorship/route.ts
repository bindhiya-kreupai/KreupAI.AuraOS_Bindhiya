import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('learning/mentorship:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing learning/mentorship:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);
    const mentorId = searchParams.get('mentorId');
    const menteeId = searchParams.get('menteeId') || searchParams.get('userId');

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (mentorId) where.mentorId = mentorId;
    if (menteeId) where.menteeId = menteeId;

    const programs = await prisma.mentoringProgram.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const activeMatches = programs
      .filter((p) => p.status === 'active')
      .map((p) => ({
        id: p.id,
        mentor: { id: p.mentorId, name: p.name },
        mentee: { id: p.menteeId },
        status: p.status,
        startDate: p.startDate.toISOString(),
        endDate: p.endDate?.toISOString(),
        goals: p.goals,
        meetingFrequency: p.meetingFrequency,
      }));

    const pastMatches = programs
      .filter((p) => p.status === 'completed' || p.status === 'cancelled')
      .map((p) => ({
        id: p.id,
        mentor: { id: p.mentorId, name: p.name },
        mentee: { id: p.menteeId },
        status: p.status,
        startDate: p.startDate.toISOString(),
        endDate: p.endDate?.toISOString(),
      }));

    return NextResponse.json({
      success: true,
      data: {
        userId: menteeId || user.userId,
        activeMatches,
        pastMatches,
        availableMentors: [],
      },
    });
  } catch (_error) {
    return NextResponse.json({
      success: true,
      data: {
        userId: context.user.userId,
        activeMatches: [],
        pastMatches: [],
        availableMentors: [],
      },
    });
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('learning/mentorship:create')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing learning/mentorship:create permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const body = await request.json();

    const program = await prisma.mentoringProgram.create({
      data: {
        tenantId: user.tenantId,
        name: body.programName || body.name || 'Mentorship Program',
        description: body.description || body.message,
        mentorId: body.mentorId,
        menteeId: body.menteeId || user.userId,
        status: 'active',
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : null,
        goals: body.goals,
        meetingFrequency: body.preferredSchedule?.frequency || body.meetingFrequency || 'biweekly',
        createdBy: user.userId,
      },
    });

    return NextResponse.json(
      { success: true, data: program, message: 'Mentorship request submitted successfully' },
      { status: 201 }
    );
  } catch (_error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create mentoring program' },
      { status: 500 }
    );
  }
});
