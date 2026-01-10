import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

// GET - Fetch single gap analysis
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const gapAnalysis = await prisma.gapAnalysis.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        competency: {
                            include: {
                                category: true,
                                developmentResources: true
                            }
                        },
                        currentLevel: true,
                        targetLevel: true
                    },
                    orderBy: [
                        { priority: 'asc' },
                        { gapScore: 'desc' }
                    ]
                },
                developmentPlan: {
                    include: {
                        activities: true,
                        milestones: true
                    }
                }
            }
        });

        if (!gapAnalysis) {
            return NextResponse.json(
                { success: false, error: 'Gap analysis not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: gapAnalysis
        });
    } catch (error) {
        logger.error('Error fetching gap analysis:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch gap analysis' },
            { status: 500 }
        );
    }
}

// PUT - Update gap analysis
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const { name, type, targetType, targetId, status, items } = body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (type !== undefined) updateData.type = type;
        if (targetType !== undefined) updateData.targetType = targetType;
        if (targetId !== undefined) updateData.targetId = targetId;
        if (status !== undefined) updateData.status = status;

        // Update items if provided
        if (items !== undefined) {
            await prisma.gapAnalysisItem.deleteMany({
                where: { gapAnalysisId: id }
            });

            if (items.length > 0) {
                await prisma.gapAnalysisItem.createMany({
                    data: items.map((item: any) => ({
                        gapAnalysisId: id,
                        competencyId: item.competencyId,
                        currentLevelId: item.currentLevelId,
                        targetLevelId: item.targetLevelId,
                        gapScore: item.gapScore,
                        priority: item.priority,
                        notes: item.notes
                    }))
                });
            }
        }

        const gapAnalysis = await prisma.gapAnalysis.update({
            where: { id },
            data: updateData,
            include: {
                items: {
                    include: {
                        competency: { include: { category: true } },
                        currentLevel: true,
                        targetLevel: true
                    }
                },
                developmentPlan: true
            }
        });

        return NextResponse.json({
            success: true,
            data: gapAnalysis,
            message: 'Gap analysis updated successfully'
        });
    } catch (error) {
        logger.error('Error updating gap analysis:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update gap analysis' },
            { status: 500 }
        );
    }
}

// DELETE - Delete gap analysis
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Check if there's an associated development plan
        const plan = await prisma.developmentPlan.findFirst({
            where: { gapAnalysisId: id }
        });

        if (plan) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: 'Cannot delete: Gap analysis has an associated development plan' 
                },
                { status: 400 }
            );
        }

        await prisma.gapAnalysis.delete({ where: { id } });

        return NextResponse.json({
            success: true,
            message: 'Gap analysis deleted successfully'
        });
    } catch (error) {
        logger.error('Error deleting gap analysis:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete gap analysis' },
            { status: 500 }
        );
    }
}
