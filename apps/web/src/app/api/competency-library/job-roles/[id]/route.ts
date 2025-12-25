import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

// GET - Fetch single job role with mappings
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const jobRole = await prisma.jobRole.findUnique({
            where: { id },
            include: {
                competencyMappings: {
                    include: {
                        competency: {
                            include: {
                                category: true,
                                proficiencyDescriptors: {
                                    include: { level: true }
                                }
                            }
                        },
                        requiredLevel: true
                    },
                    orderBy: [
                        { isRequired: 'desc' },
                        { weight: 'desc' }
                    ]
                }
            }
        });

        if (!jobRole) {
            return NextResponse.json(
                { success: false, error: 'Job role not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: jobRole
        });
    } catch {
        logger.error('Error fetching job role:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch job role' },
            { status: 500 }
        );
    }
}

// PUT - Update job role and mappings
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const { name, departmentId, description, level, status, competencyMappings } = body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (departmentId !== undefined) updateData.departmentId = departmentId;
        if (description !== undefined) updateData.description = description;
        if (level !== undefined) updateData.level = level;
        if (status !== undefined) updateData.status = status;

        // Update competency mappings if provided
        if (competencyMappings !== undefined) {
            // Delete existing mappings
            await prisma.jobCompetencyMapping.deleteMany({
                where: { jobRoleId: id }
            });

            // Create new mappings
            if (competencyMappings.length > 0) {
                await prisma.jobCompetencyMapping.createMany({
                    data: competencyMappings.map((mapping: any) => ({
                        jobRoleId: id,
                        competencyId: mapping.competencyId,
                        requiredLevelId: mapping.requiredLevelId,
                        weight: mapping.weight || 1.0,
                        isRequired: mapping.isRequired !== false
                    }))
                });
            }
        }

        const jobRole = await prisma.jobRole.update({
            where: { id },
            data: updateData,
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
            message: 'Job role updated successfully'
        });
    } catch {
        logger.error('Error updating job role:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update job role' },
            { status: 500 }
        );
    }
}

// DELETE - Delete job role
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Check if job role is in use by assessments
        const usageCount = await prisma.skillAssessment.count({
            where: { jobRoleId: id }
        });

        if (usageCount > 0) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: `Cannot delete: Job role is used by ${usageCount} assessment(s)` 
                },
                { status: 400 }
            );
        }

        await prisma.jobRole.delete({ where: { id } });

        return NextResponse.json({
            success: true,
            message: 'Job role deleted successfully'
        });
    } catch {
        logger.error('Error deleting job role:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete job role' },
            { status: 500 }
        );
    }
}
