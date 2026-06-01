import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { withAudit } from '@/lib/middleware/audit.middleware';
import { AuditAction } from '@/lib/audit/audit.service';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/recruitment/interviews/[id]/feedback
 * Submit feedback for a completed interview
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
      const { id } = await context.params;
      const body = await request.json();

      if (!body.recommendation || body.rating == null) {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'E2001', message: 'recommendation and rating are required' },
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

      if (interview.status === 'cancelled') {
        return NextResponse.json(
          {
            success: false,
            error: { code: 'E4003', message: 'Cannot submit feedback for a cancelled interview' },
          },
          { status: 422 }
        );
      }

      // Check for existing feedback (no composite unique key in schema)
      const existingFeedback = await prisma.interviewFeedback.findFirst({
        where: { interviewId: id, interviewerId: user.id },
      });

      // Store detailed ratings in criteria JSON
      const criteria = {
        ...(body.criteria || {}),
        ...(body.technicalSkillsRating != null
          ? { technicalSkills: body.technicalSkillsRating }
          : {}),
        ...(body.communicationRating != null ? { communication: body.communicationRating } : {}),
        ...(body.cultureFitRating != null ? { cultureFit: body.cultureFitRating } : {}),
        ...(body.leadershipRating != null ? { leadership: body.leadershipRating } : {}),
        ...(body.competencyScores ? { competencyScores: body.competencyScores } : {}),
      };

      let feedback;
      if (existingFeedback) {
        feedback = await prisma.interviewFeedback.update({
          where: { id: existingFeedback.id },
          data: {
            recommendation: body.recommendation,
            rating: body.rating,
            strengths: body.strengths || null,
            weaknesses: body.weaknesses || null,
            comments: body.comments || body.notes || null,
            criteria: Object.keys(criteria).length > 0 ? criteria : undefined,
            submittedAt: new Date(),
          },
        });
      } else {
        feedback = await prisma.interviewFeedback.create({
          data: {
            interviewId: id,
            interviewerId: user.id,
            recommendation: body.recommendation,
            rating: body.rating,
            strengths: body.strengths || null,
            weaknesses: body.weaknesses || null,
            comments: body.comments || body.notes || null,
            criteria: Object.keys(criteria).length > 0 ? criteria : undefined,
            submittedAt: new Date(),
          },
        });
      }

      // Update interview: mark feedbackSubmitted, compute average rating
      const allFeedback = await prisma.interviewFeedback.findMany({
        where: { interviewId: id },
      });

      const expectedInterviewers = interview.interviewerIds as string[];
      const allSubmitted = allFeedback.length >= expectedInterviewers.length;
      const avgRating = allFeedback.reduce((sum, f) => sum + f.rating, 0) / allFeedback.length;

      await prisma.interview.update({
        where: { id },
        data: {
          feedbackSubmitted: true,
          overallRating: Math.round(avgRating * 100) / 100,
          ...(allSubmitted && interview.status === 'scheduled' ? { status: 'completed' } : {}),
        },
      });

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
    } catch (error: any) {
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
  }),
  {
    action: AuditAction.EMPLOYEE_UPDATED,
    resourceType: 'interview_feedback',
    captureRequestBody: true,
  }
);
