import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// POST - Submit assessment results
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const { results, assessorId, assessorType } = body;

        // Validate assessment exists
        const assessment = await prisma.skillAssessment.findUnique({
            where: { id }
        });

        if (!assessment) {
            return NextResponse.json(
                { success: false, error: 'Assessment not found' },
                { status: 404 }
            );
        }

        // Create results
        const createdResults = [];
        for (const result of results) {
            const existingResult = await prisma.skillAssessmentResult.findFirst({
                where: {
                    assessmentId: id,
                    competencyId: result.competencyId,
                    assessorId: assessorId || null
                }
            });

            if (existingResult) {
                // Update existing result
                const updated = await prisma.skillAssessmentResult.update({
                    where: { id: existingResult.id },
                    data: {
                        ratingLevelId: result.ratingLevelId,
                        comments: result.comments,
                        evidence: result.evidence
                    },
                    include: { ratingLevel: true }
                });
                createdResults.push(updated);
            } else {
                // Create new result
                const created = await prisma.skillAssessmentResult.create({
                    data: {
                        assessmentId: id,
                        competencyId: result.competencyId,
                        assessorId,
                        assessorType,
                        ratingLevelId: result.ratingLevelId,
                        comments: result.comments,
                        evidence: result.evidence
                    },
                    include: { ratingLevel: true }
                });
                createdResults.push(created);
            }
        }

        // Check if all competencies have been rated
        const [totalCompetencies, totalResults] = await Promise.all([
            prisma.skillAssessmentCompetency.count({ where: { assessmentId: id } }),
            prisma.skillAssessmentResult.count({ where: { assessmentId: id } })
        ]);

        // Update assessment status if complete
        if (totalResults >= totalCompetencies && assessment.status === 'In Progress') {
            await prisma.skillAssessment.update({
                where: { id },
                data: {
                    status: 'Completed',
                    completedAt: new Date()
                }
            });
        }

        return NextResponse.json({
            success: true,
            data: createdResults,
            message: 'Results submitted successfully'
        });
    } catch (error) {
        console.error('Error submitting results:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to submit results' },
            { status: 500 }
        );
    }
}

// GET - Get results for an assessment
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const { searchParams } = new URL(request.url);
        const assessorId = searchParams.get('assessorId');

        const where: any = { assessmentId: id };
        if (assessorId) where.assessorId = assessorId;

        const results = await prisma.skillAssessmentResult.findMany({
            where,
            include: {
                ratingLevel: true
            }
        });

        return NextResponse.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Error fetching results:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch results' },
            { status: 500 }
        );
    }
}
