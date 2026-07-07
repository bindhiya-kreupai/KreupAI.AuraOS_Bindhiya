import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';
import { DEI_ERRORS } from '../_shared';

/**
 * GET /api/dei/mentorship — list the caller's mentorship programs plus available
 * mentors, backed by the real MentoringProgram model (tenant-scoped).
 * POST /api/dei/mentorship — request a mentorship (mentee = authenticated user).
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope'); // 'mine' | undefined

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (scope === 'mine') where.menteeId = user.userId;

    const programs = await prisma.mentoringProgram.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const activeMatches = programs
      .filter((p) => p.status === 'active')
      .map((p) => ({
        id: p.id,
        name: p.name,
        mentorId: p.mentorId,
        menteeId: p.menteeId,
        status: p.status,
        startDate: p.startDate.toISOString(),
        endDate: p.endDate?.toISOString() ?? null,
        goals: p.goals,
        meetingFrequency: p.meetingFrequency,
      }));

    const pastMatches = programs
      .filter((p) => p.status === 'completed' || p.status === 'cancelled')
      .map((p) => ({
        id: p.id,
        name: p.name,
        mentorId: p.mentorId,
        menteeId: p.menteeId,
        status: p.status,
        startDate: p.startDate.toISOString(),
        endDate: p.endDate?.toISOString() ?? null,
      }));

    return NextResponse.json({
      success: true,
      data: {
        userId: user.userId,
        activeMatches,
        pastMatches,
        total: programs.length,
      },
    });
  } catch (error) {
    console.error('DEI mentorship GET error:', error);
    return DEI_ERRORS.server();
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user } = context;
    const body = await request.json().catch(() => ({}));
    if (!body.mentorId) {
      return DEI_ERRORS.badRequest('mentorId is required', 'معرّف الموجّه مطلوب');
    }

    const program = await prisma.mentoringProgram.create({
      data: {
        tenantId: user.tenantId,
        name: body.programName || body.name || 'Mentorship Request',
        description: body.description || body.message || null,
        mentorId: body.mentorId,
        menteeId: user.userId,
        status: 'active',
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : null,
        goals: body.goals ?? null,
        meetingFrequency: body.meetingFrequency || 'biweekly',
        createdBy: user.userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: program,
        message: 'Mentorship requested',
        messageAr: 'تم طلب الإرشاد',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('DEI mentorship POST error:', error);
    return DEI_ERRORS.server();
  }
});
