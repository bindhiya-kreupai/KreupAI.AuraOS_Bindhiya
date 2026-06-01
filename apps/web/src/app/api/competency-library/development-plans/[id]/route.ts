import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

// GET - Fetch single development plan
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const plan = await prisma.developmentPlan.findUnique({
            where: { id },
            include: {
                gapAnalysis: {
                    include: {
                        items: {
                            include: {
                                competency: {
                                    include: { category: true }
                                },
                                currentLevel: true,
                                targetLevel: true
                            }
                        }
                    }
                },
                activities: {
                    orderBy: { sortOrder: 'asc' }
                },
                milestones: {
                    orderBy: { targetDate: 'asc' }
                }
            }
        });

        if (!plan) {
            return NextResponse.json(
                { success: false, error: 'Development plan not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: plan
        });
    } catch (error: any) {
        logger.error('Error fetching development plan:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch development plan' },
            { status: 500 }
        );
    }
}

// PUT - Update development plan
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
            targetType,
            targetId,
            status,
            startDate,
            endDate,
            budget,
            activities,
            milestones
        } = body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (type !== undefined) updateData.type = type;
        if (targetType !== undefined) updateData.targetType = targetType;
        if (targetId !== undefined) updateData.targetId = targetId;
        if (status !== undefined) updateData.status = status;
        if (startDate !== undefined) updateData.startDate = new Date(startDate);
        if (endDate !== undefined) updateData.endDate = new Date(endDate);
        if (budget !== undefined) updateData.budget = budget;

        // Update activities if provided
        if (activities !== undefined) {
            await prisma.developmentActivity.deleteMany({
                where: { developmentPlanId: id }
            });

            if (activities.length > 0) {
                await prisma.developmentActivity.createMany({
                    data: activities.map((activity: any, index: number) => ({
                        developmentPlanId: id,
                        name: activity.name,
                        type: activity.type,
                        provider: activity.provider,
                        description: activity.description,
                        duration: activity.duration,
                        estimatedCost: activity.estimatedCost,
                        actualCost: activity.actualCost,
                        startDate: activity.startDate ? new Date(activity.startDate) : null,
                        endDate: activity.endDate ? new Date(activity.endDate) : null,
                        completedAt: activity.completedAt ? new Date(activity.completedAt) : null,
                        status: activity.status || 'Planned',
                        competencyIds: activity.competencyIds,
                        sortOrder: index
                    }))
                });
            }
        }

        // Update milestones if provided
        if (milestones !== undefined) {
            await prisma.developmentMilestone.deleteMany({
                where: { developmentPlanId: id }
            });

            if (milestones.length > 0) {
                await prisma.developmentMilestone.createMany({
                    data: milestones.map((milestone: any, index: number) => ({
                        developmentPlanId: id,
                        name: milestone.name,
                        description: milestone.description,
                        targetDate: new Date(milestone.targetDate),
                        completedAt: milestone.completedAt ? new Date(milestone.completedAt) : null,
                        status: milestone.status || 'Pending',
                        sortOrder: index
                    }))
                });
            }
        }

        const plan = await prisma.developmentPlan.update({
            where: { id },
            data: updateData,
            include: {
                gapAnalysis: true,
                activities: { orderBy: { sortOrder: 'asc' } },
                milestones: { orderBy: { targetDate: 'asc' } }
            }
        });

        return NextResponse.json({
            success: true,
            data: plan,
            message: 'Development plan updated successfully'
        });
    } catch (error: any) {
        logger.error('Error updating development plan:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update development plan' },
            { status: 500 }
        );
    }
}

// DELETE - Delete development plan
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Check if plan is in progress
        const plan = await prisma.developmentPlan.findUnique({
            where: { id },
            include: {
                activities: true
            }
        });

        if (plan?.status === 'In Progress') {
            const inProgressActivities = plan.activities.filter(a => a.status === 'In Progress').length;
            if (inProgressActivities > 0) {
                return NextResponse.json(
                    { 
                        success: false, 
                        error: `Cannot delete: Plan has ${inProgressActivities} activities in progress` 
                    },
                    { status: 400 }
                );
            }
        }

        await prisma.developmentPlan.delete({ where: { id } });

        return NextResponse.json({
            success: true,
            message: 'Development plan deleted successfully'
        });
    } catch (error: any) {
        logger.error('Error deleting development plan:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete development plan' },
            { status: 500 }
        );
    }
}
