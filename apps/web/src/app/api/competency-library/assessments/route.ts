import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';

// GET - Fetch all skill assessments
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const status = searchParams.get('status');
        const employeeId = searchParams.get('employeeId');
        const cycleId = searchParams.get('cycleId');
        const page = parseInt(searchParams.get('page') || '1');
        const pageSize = parseInt(searchParams.get('pageSize') || '50');

        const where: any = {};
        
        if (type) where.type = type;
        if (status) where.status = status;
        if (employeeId) where.employeeId = employeeId;
        if (cycleId) where.cycleId = cycleId;

        const [assessments, total] = await Promise.all([
            prisma.skillAssessment.findMany({
                where,
                include: {
                    jobRole: true,
                    competencies: {
                        include: {
                            competency: {
                                include: { category: true }
                            }
                        }
                    },
                    results: {
                        include: { ratingLevel: true }
                    }
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.skillAssessment.count({ where })
        ]);

        // Calculate completion stats for each assessment
        const transformed = assessments.map(assessment => {
            const totalCompetencies = assessment.competencies.length;
            const completedResults = assessment.results.length;
            const completionRate = totalCompetencies > 0 
                ? Math.round((completedResults / totalCompetencies) * 100) 
                : 0;

            return {
                ...assessment,
                completionRate,
                totalCompetencies,
                completedResults
            };
        });

        return NextResponse.json({
            success: true,
            data: transformed,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        });
    } catch (error) {
        console.error('Error fetching assessments:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch assessments' },
            { status: 500 }
        );
    }
}

// POST - Create a new skill assessment
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            name,
            description,
            type,
            employeeId,
            jobRoleId,
            cycleId,
            assessorIds,
            startDate,
            endDate,
            competencyIds = [],
            createdBy = 'system'
        } = body;

        // Generate unique code
        const code = `SA-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase()}`;

        const assessment = await prisma.skillAssessment.create({
            data: {
                code,
                name,
                description,
                type,
                status: 'Draft',
                employeeId,
                jobRoleId,
                cycleId,
                assessorIds: assessorIds || null,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                createdBy,
                competencies: {
                    create: competencyIds.map((compId: string) => ({
                        competencyId: compId,
                        weight: 1.0
                    }))
                }
            },
            include: {
                jobRole: true,
                competencies: {
                    include: {
                        competency: { include: { category: true } }
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: assessment,
            message: 'Assessment created successfully'
        });
    } catch (error) {
        console.error('Error creating assessment:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create assessment' },
            { status: 500 }
        );
    }
}
