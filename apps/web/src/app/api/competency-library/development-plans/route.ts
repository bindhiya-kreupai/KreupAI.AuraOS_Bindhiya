import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

// GET - Fetch all development plans
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const targetType = searchParams.get('targetType');
        const targetId = searchParams.get('targetId');
        const status = searchParams.get('status');

        const where: any = {};
        
        if (type) where.type = type;
        if (targetType) where.targetType = targetType;
        if (targetId) where.targetId = targetId;
        if (status) where.status = status;

        const plans = await prisma.developmentPlan.findMany({
            where,
            include: {
                gapAnalysis: {
                    include: {
                        items: {
                            include: {
                                competency: true
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
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate progress and stats for each plan
        const transformed = plans.map(plan => {
            const totalActivities = plan.activities.length;
            const completedActivities = plan.activities.filter(a => a.status === 'Completed').length;
            const inProgressActivities = plan.activities.filter(a => a.status === 'In Progress').length;
            
            const totalMilestones = plan.milestones.length;
            const achievedMilestones = plan.milestones.filter(m => m.status === 'Achieved').length;
            
            const totalCost = plan.activities.reduce((sum, a) => sum + (a.estimatedCost || 0), 0);
            const actualCost = plan.activities.reduce((sum, a) => sum + (a.actualCost || 0), 0);
            
            const progressPercent = totalActivities > 0 
                ? Math.round((completedActivities / totalActivities) * 100) 
                : 0;

            return {
                ...plan,
                totalActivities,
                completedActivities,
                inProgressActivities,
                totalMilestones,
                achievedMilestones,
                progressPercent,
                totalCost,
                actualCost,
                competenciesAddressed: plan.gapAnalysis?.items.length || 0
            };
        });

        return NextResponse.json({
            success: true,
            data: transformed
        });
    } catch (error: any) {
        logger.error('Error fetching development plans:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch development plans' },
            { status: 500 }
        );
    }
}

// POST - Create a new development plan
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            name,
            description,
            type,
            targetType,
            targetId,
            gapAnalysisId,
            startDate,
            endDate,
            budget,
            activities = [],
            milestones = [],
            createdBy = 'system'
        } = body;

        // Generate unique code
        const code = `DP-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;

        const plan = await prisma.developmentPlan.create({
            data: {
                code,
                name,
                description,
                type,
                targetType,
                targetId,
                gapAnalysisId,
                status: 'Draft',
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                budget,
                createdBy,
                activities: {
                    create: activities.map((activity: any, index: number) => ({
                        name: activity.name,
                        type: activity.type,
                        provider: activity.provider,
                        description: activity.description,
                        duration: activity.duration,
                        estimatedCost: activity.estimatedCost,
                        startDate: activity.startDate ? new Date(activity.startDate) : null,
                        endDate: activity.endDate ? new Date(activity.endDate) : null,
                        status: 'Planned',
                        competencyIds: activity.competencyIds,
                        sortOrder: index
                    }))
                },
                milestones: {
                    create: milestones.map((milestone: any, index: number) => ({
                        name: milestone.name,
                        description: milestone.description,
                        targetDate: new Date(milestone.targetDate),
                        status: 'Pending',
                        sortOrder: index
                    }))
                }
            },
            include: {
                gapAnalysis: true,
                activities: { orderBy: { sortOrder: 'asc' } },
                milestones: { orderBy: { targetDate: 'asc' } }
            }
        });

        return NextResponse.json({
            success: true,
            data: plan,
            message: 'Development plan created successfully'
        });
    } catch (error: any) {
        logger.error('Error creating development plan:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create development plan' },
            { status: 500 }
        );
    }
}
