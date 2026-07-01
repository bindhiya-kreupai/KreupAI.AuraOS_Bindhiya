import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';
import { SubmitResultsSchema, validateBody } from '@/lib/validators/competency-library-api';

interface AssessmentResultInput {
  competencyId: string;
  ratingLevelId: string;
  comments?: string;
  evidence?: string;
}

// POST - Submit assessment results
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const validation = validateBody(SubmitResultsSchema, body);
    if (validation.response) return validation.response;
    const { results, assessorId, assessorType } = validation.data as {
      results: AssessmentResultInput[];
      assessorId?: string;
      assessorType?: string;
    };

    // Validate assessment exists
    const assessment = await prisma.skillAssessment.findUnique({
      where: { id },
    });

    if (!assessment) {
      return NextResponse.json(
        {
          success: false,
          message: 'Assessment not found',
          messageAr: 'التقييم غير موجود',
          error: 'Assessment not found',
        },
        { status: 404 }
      );
    }

    // Batch fetch existing results in ONE query to avoid N+1
    const competencyIds = results.map((r: AssessmentResultInput) => r.competencyId);
    const existingResults = await prisma.skillAssessmentResult.findMany({
      where: {
        assessmentId: id,
        competencyId: { in: competencyIds },
        assessorId: assessorId || null,
      },
    });

    // Create lookup map for O(1) access
    const existingResultsMap = new Map(existingResults.map((r) => [r.competencyId, r] as const));

    // Batch all operations in a transaction
    const createdResults = await prisma.$transaction(
      results.map((result: AssessmentResultInput) => {
        const existing = existingResultsMap.get(result.competencyId);

        if (existing) {
          // Update existing result
          return prisma.skillAssessmentResult.update({
            where: { id: existing.id },
            data: {
              ratingLevelId: result.ratingLevelId,
              comments: result.comments,
              evidence: result.evidence,
            },
            include: { ratingLevel: true },
          });
        } else {
          // Create new result
          return prisma.skillAssessmentResult.create({
            data: {
              assessmentId: id,
              competencyId: result.competencyId,
              assessorId,
              assessorType,
              ratingLevelId: result.ratingLevelId,
              comments: result.comments,
              evidence: result.evidence,
            },
            include: { ratingLevel: true },
          });
        }
      })
    );

    // Check if all competencies have been rated
    const [totalCompetencies, totalResults] = await Promise.all([
      prisma.skillAssessmentCompetency.count({ where: { assessmentId: id } }),
      prisma.skillAssessmentResult.count({ where: { assessmentId: id } }),
    ]);

    // Update assessment status if complete
    if (totalResults >= totalCompetencies && assessment.status === 'In Progress') {
      await prisma.skillAssessment.update({
        where: { id },
        data: {
          status: 'Completed',
          completedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: createdResults,
      message: 'Results submitted successfully',
    });
  } catch (error: any) {
    logger.error('Error submitting results:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit results' },
      { status: 500 }
    );
  }
}

// GET - Get results for an assessment
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const assessorId = searchParams.get('assessorId');

    const where: any = { assessmentId: id };
    if (assessorId) where.assessorId = assessorId;

    const results = await prisma.skillAssessmentResult.findMany({
      where,
      include: {
        ratingLevel: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    logger.error('Error fetching results:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch results' }, { status: 500 });
  }
}
