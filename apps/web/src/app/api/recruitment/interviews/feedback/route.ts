import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/database';
import { withEnhancedAuth } from '@/lib/auth';

export const GET = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { searchParams } = new URL(request.url);
    const interviewId = searchParams.get('interviewId');
    const candidateId = searchParams.get('candidateId');

    const where: Record<string, unknown> = {};
    if (interviewId) where.interviewId = interviewId;
    if (candidateId) {
      where.interview = {
        application: {
          candidateId,
        },
      };
    }

    const feedback = await prisma.interviewFeedback.findMany({
      where,
      include: {
        interview: {
          select: {
            id: true,
            title: true,
            type: true,
            scheduledDate: true,
            status: true,
            application: {
              select: {
                candidateId: true,
              },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return NextResponse.json({ data: feedback }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context) => {
  try {
    const { user, employeeId } = context;
    const body = await request.json();

    if (!body.interviewId) {
      return NextResponse.json(
        { error: 'interviewId is required' },
        { status: 400 }
      );
    }

    const newFeedback = await prisma.interviewFeedback.create({
      data: {
        interviewId: body.interviewId,
        interviewerId: employeeId || user.userId,
        rating: body.rating || body.overallRating || 0,
        strengths: Array.isArray(body.strengths) ? body.strengths.join('; ') : body.strengths || null,
        weaknesses: Array.isArray(body.weaknesses) ? body.weaknesses.join('; ') : body.weaknesses || null,
        recommendation: body.recommendation || null,
        comments: body.detailedComments || body.comments || null,
        criteria: body.criteria || null,
      },
    });

    return NextResponse.json({ data: newFeedback }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});
