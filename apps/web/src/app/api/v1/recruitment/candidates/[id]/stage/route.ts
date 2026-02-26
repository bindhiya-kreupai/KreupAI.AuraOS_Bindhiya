import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

const PIPELINE_STAGES = [
  'APPLIED',
  'SCREENING',
  'PHONE_INTERVIEW',
  'TECHNICAL_INTERVIEW',
  'HIRING_MANAGER_INTERVIEW',
  'FINAL_INTERVIEW',
  'OFFER',
  'OFFER_ACCEPTED',
  'HIRED',
  'REJECTED',
  'WITHDRAWN',
] as const;

/**
 * PUT /api/v1/recruitment/candidates/[id]/stage
 * Move a candidate to a different pipeline stage
 */
export const PUT = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const { id } = context.params; // This is the candidateApplication ID
    const body = await request.json();

    if (!body.stage) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: `stage is required. Must be one of: ${PIPELINE_STAGES.join(', ')}`,
          },
        },
        { status: 400 }
      );
    }

    if (!PIPELINE_STAGES.includes(body.stage as any)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E2001',
            message: `Invalid stage. Must be one of: ${PIPELINE_STAGES.join(', ')}`,
          },
        },
        { status: 400 }
      );
    }

    const application = await prisma.candidateApplication.findUnique({ where: { id } });

    if (!application) {
      return NextResponse.json(
        { success: false, error: { code: 'E4001', message: 'Candidate application not found' } },
        { status: 404 }
      );
    }

    const terminalStages = ['HIRED', 'REJECTED', 'WITHDRAWN', 'OFFER_ACCEPTED'];
    if (terminalStages.includes(application.currentStage)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4003',
            message: `Cannot move candidate from terminal stage: ${application.currentStage}`,
          },
        },
        { status: 422 }
      );
    }

    const updated = await prisma.candidateApplication.update({
      where: { id },
      data: {
        currentStage: body.stage,
        previousStage: application.currentStage,
        stageChangedAt: new Date(),
        stageChangedBy: user.id,
        stageChangeReason: body.reason || null,
        status:
          body.stage === 'HIRED' ? 'HIRED' : body.stage === 'REJECTED' ? 'REJECTED' : 'IN_PROGRESS',
      },
      include: {
        candidate: { select: { id: true, firstName: true, lastName: true, email: true } },
        jobPosting: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: `Candidate moved to ${body.stage} stage`,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    console.error('[Candidate Stage API] PUT Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to update candidate stage' } },
      { status: 500 }
    );
  }
});
