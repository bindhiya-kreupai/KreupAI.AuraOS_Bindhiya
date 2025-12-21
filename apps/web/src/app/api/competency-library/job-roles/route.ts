import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

// GET - Fetch all job roles with competency mappings
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const departmentId = searchParams.get('departmentId');
        const level = searchParams.get('level');
        const search = searchParams.get('search');

        const where: any = { status: 'Active' };
        
        if (departmentId) where.departmentId = departmentId;
        if (level) where.level = level;
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } }
            ];
        }

        const jobRoles = await prisma.jobRole.findMany({
            where,
            include: {
                competencyMappings: {
                    include: {
                        competency: {
                            include: { category: true }
                        },
                        requiredLevel: true
                    },
                    orderBy: [
                        { isRequired: 'desc' },
                        { weight: 'desc' }
                    ]
                },
                _count: {
                    select: { competencyMappings: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        const transformed = jobRoles.map(role => ({
            ...role,
            competencyCount: role._count.competencyMappings,
            requiredCompetencies: role.competencyMappings.filter(m => m.isRequired).length,
            preferredCompetencies: role.competencyMappings.filter(m => !m.isRequired).length
        }));

        return NextResponse.json({
            success: true,
            data: transformed
        });
    } catch (error) {
        logger.error('Error fetching job roles:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch job roles' },
            { status: 500 }
        );
    }
}

// POST - Create a new job role with competency mappings
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, name, departmentId, description, level, competencyMappings = [] } = body;

        // Generate code if not provided
        const finalCode = code || `JR-${Date.now()}`;

        const jobRole = await prisma.jobRole.create({
            data: {
                code: finalCode,
                name,
                departmentId,
                description,
                level,
                competencyMappings: {
                    create: competencyMappings.map((mapping: any) => ({
                        competencyId: mapping.competencyId,
                        requiredLevelId: mapping.requiredLevelId,
                        weight: mapping.weight || 1.0,
                        isRequired: mapping.isRequired !== false
                    }))
                }
            },
            include: {
                competencyMappings: {
                    include: {
                        competency: { include: { category: true } },
                        requiredLevel: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: jobRole,
            message: 'Job role created successfully'
        });
    } catch (error: any) {
        logger.error('Error creating job role:', error);
        if (error.code === 'P2002') {
            return NextResponse.json(
                { success: false, error: 'A job role with this code already exists' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Failed to create job role' },
            { status: 500 }
        );
    }
}
