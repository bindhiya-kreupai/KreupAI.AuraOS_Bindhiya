import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/recruitment/interviews/[id]/feedback
 * Submit feedback for a completed interview
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { id } = context.params;
    const body = await request.json();

    if (!body.recommendation || !body.overallRating) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E2001', message: 'recommendation and overallRating are required' },
        },
        { status: 400 }
      );
    }

    const VALID_RECOMMENDATIONS = ['STRONG_HIRE', 'HIRE', 'NEUTRAL', 'NO_HIRE', 'STRONG_NO_HIRE'];
    if (!VALID_RECOMMENDATIONS.includes(body.recommendation)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: `recommendation must be one of: ${VALID_RECOMMENDATIONS.join(', ')}`,
          },
        },
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

    if (interview.status === 'CANCELLED') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E4003', message: 'Cannot submit feedback for a cancelled interview' },
        },
        { status: 422 }
      );
    }

    // Create or update interview feedback
    const feedback = await prisma.interviewFeedback.upsert({
      where: {
        interviewId_interviewerId: { interviewId: id, interviewerId: user.id },
      },
      create: {
        interviewId: id,
        interviewerId: user.id,
        recommendation: body.recommendation,
        overallRating: body.overallRating,
        technicalSkillsRating: body.technicalSkillsRating || null,
        communicationRating: body.communicationRating || null,
        cultureFitRating: body.cultureFitRating || null,
        leadershipRating: body.leadershipRating || null,
        strengths: body.strengths || null,
        weaknesses: body.weaknesses || null,
        notes: body.notes || null,
        competencyScores: body.competencyScores || null,
        submittedAt: new Date(),
      },
      update: {
        recommendation: body.recommendation,
        overallRating: body.overallRating,
        technicalSkillsRating: body.technicalSkillsRating,
        communicationRating: body.communicationRating,
        cultureFitRating: body.cultureFitRating,
        leadershipRating: body.leadershipRating,
        strengths: body.strengths,
        weaknesses: body.weaknesses,
        notes: body.notes,
        competencyScores: body.competencyScores,
        updatedAt: new Date(),
      },
    });

    // Update interview status to COMPLETED if all interviewers have submitted feedback
    const expectedInterviewers = interview.interviewers as string[];
    const submittedFeedback = await prisma.interviewFeedback.count({
      where: { interviewId: id },
    });

    if (submittedFeedback >= expectedInterviewers.length && interview.status === 'SCHEDULED') {
      await prisma.interview.update({
        where: { id },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
    }

    return NextResponse.json(
      {
        success: true,
        data: feedback,
        message: 'Interview feedback submitted successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
          apiVersion: 'v1',
        },
      },
      { status: 201 }
    );
  } catch (_error) {
    console.error('[Interview Feedback API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to submit interview feedback',
          details: { error: error instanceof Error ? error.message : 'Unknown error' },
        },
      },
      { status: 500 }
    );
  }
});
