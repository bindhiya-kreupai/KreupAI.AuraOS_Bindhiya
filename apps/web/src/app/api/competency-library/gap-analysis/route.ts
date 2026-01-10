import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

// GET - Fetch all gap analyses
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

        const gapAnalyses = await prisma.gapAnalysis.findMany({
            where,
            include: {
                items: {
                    include: {
                        competency: {
                            include: { category: true }
                        },
                        currentLevel: true,
                        targetLevel: true
                    },
                    orderBy: [
                        { priority: 'asc' },
                        { gapScore: 'desc' }
                    ]
                },
                developmentPlan: true
            },
            orderBy: { analysisDate: 'desc' }
        });

        // Calculate summary stats for each analysis
        const transformed = gapAnalyses.map(analysis => {
            const criticalGaps = analysis.items.filter(i => i.priority === 'Critical').length;
            const highGaps = analysis.items.filter(i => i.priority === 'High').length;
            const avgGapScore = analysis.items.length > 0
                ? analysis.items.reduce((sum, i) => sum + i.gapScore, 0) / analysis.items.length
                : 0;

            return {
                ...analysis,
                criticalGaps,
                highGaps,
                totalGaps: analysis.items.length,
                avgGapScore: Math.round(avgGapScore * 100) / 100,
                hasDevelopmentPlan: !!analysis.developmentPlan
            };
        });

        return NextResponse.json({
            success: true,
            data: transformed
        });
    } catch (error) {
        logger.error('Error fetching gap analyses:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch gap analyses' },
            { status: 500 }
        );
    }
}

// POST - Create a new gap analysis
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            name,
            type,
            targetType,
            targetId,
            items = [],
            createdBy = 'system'
        } = body;

        // Generate unique code
        const code = `GA-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;

        const gapAnalysis = await prisma.gapAnalysis.create({
            data: {
                code,
                name,
                type,
                targetType,
                targetId,
                createdBy,
                items: {
                    create: items.map((item: any) => ({
                        competencyId: item.competencyId,
                        currentLevelId: item.currentLevelId,
                        targetLevelId: item.targetLevelId,
                        gapScore: item.gapScore || calculateGapScore(item),
                        priority: item.priority || determinePriority(item.gapScore || calculateGapScore(item)),
                        notes: item.notes
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        competency: { include: { category: true } },
                        currentLevel: true,
                        targetLevel: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: gapAnalysis,
            message: 'Gap analysis created successfully'
        });
    } catch (error) {
        logger.error('Error creating gap analysis:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create gap analysis' },
            { status: 500 }
        );
    }
}

// Helper functions
function calculateGapScore(item: any): number {
    // Simple gap score calculation based on level difference
    const currentLevel = item.currentLevelNumber || 1;
    const targetLevel = item.targetLevelNumber || 3;
    return Math.max(0, targetLevel - currentLevel);
}

function determinePriority(gapScore: number): string {
    if (gapScore >= 3) return 'Critical';
    if (gapScore >= 2) return 'High';
    if (gapScore >= 1) return 'Medium';
    return 'Low';
}
