import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

// GET - Fetch single assessment
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const assessment = await prisma.skillAssessment.findUnique({
            where: { id },
            include: {
                jobRole: {
                    include: {
                        competencyMappings: {
                            include: {
                                competency: true,
                                requiredLevel: true
                            }
                        }
                    }
                },
                competencies: {
                    include: {
                        competency: {
                            include: {
                                category: true,
                                proficiencyDescriptors: {
                                    include: { level: true }
                                }
                            }
                        }
                    }
                },
                results: {
                    include: { ratingLevel: true }
                }
            }
        });

        if (!assessment) {
            return NextResponse.json(
                { success: false, error: 'Assessment not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: assessment
        });
    } catch (error) {
        logger.error('Error fetching assessment:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch assessment' },
            { status: 500 }
        );
    }
}

// PUT - Update assessment
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const {
            name,
            description,
            type,
            status,
            employeeId,
            jobRoleId,
            cycleId,
            assessorIds,
            startDate,
            endDate,
            competencyIds
        } = body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (type !== undefined) updateData.type = type;
        if (status !== undefined) updateData.status = status;
        if (employeeId !== undefined) updateData.employeeId = employeeId;
        if (jobRoleId !== undefined) updateData.jobRoleId = jobRoleId;
        if (cycleId !== undefined) updateData.cycleId = cycleId;
        if (assessorIds !== undefined) updateData.assessorIds = assessorIds;
        if (startDate !== undefined) updateData.startDate = new Date(startDate);
        if (endDate !== undefined) updateData.endDate = new Date(endDate);

        // Handle status changes
        if (status === 'Completed') {
            updateData.completedAt = new Date();
        }

        // Update competencies if provided
        if (competencyIds !== undefined) {
            await prisma.skillAssessmentCompetency.deleteMany({
                where: { assessmentId: id }
            });

            if (competencyIds.length > 0) {
                await prisma.skillAssessmentCompetency.createMany({
                    data: competencyIds.map((compId: string) => ({
                        assessmentId: id,
                        competencyId: compId,
                        weight: 1.0
                    }))
                });
            }
        }

        const assessment = await prisma.skillAssessment.update({
            where: { id },
            data: updateData,
            include: {
                jobRole: true,
                competencies: {
                    include: {
                        competency: { include: { category: true } }
                    }
                },
                results: {
                    include: { ratingLevel: true }
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: assessment,
            message: 'Assessment updated successfully'
        });
    } catch (error) {
        logger.error('Error updating assessment:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update assessment' },
            { status: 500 }
        );
    }
}

// DELETE - Delete assessment
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Check if assessment has results
        const resultsCount = await prisma.skillAssessmentResult.count({
            where: { assessmentId: id }
        });

        if (resultsCount > 0) {
            // Soft delete by changing status
            await prisma.skillAssessment.update({
                where: { id },
                data: { status: 'Cancelled' }
            });

            return NextResponse.json({
                success: true,
                message: 'Assessment cancelled (has results, cannot be fully deleted)'
            });
        }

        await prisma.skillAssessment.delete({ where: { id } });

        return NextResponse.json({
            success: true,
            message: 'Assessment deleted successfully'
        });
    } catch (error) {
        logger.error('Error deleting assessment:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete assessment' },
            { status: 500 }
        );
    }
}
