import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@aura/database';

// GET - Fetch single competency by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const competency = await prisma.competencyCatalog.findUnique({
            where: { id },
            include: {
                category: true,
                subcategory: true,
                proficiencyDescriptors: {
                    include: { level: true },
                    orderBy: { level: { levelNumber: 'asc' } }
                },
                applicableRoles: true,
                developmentResources: true,
                assessmentCriteria: { orderBy: { sortOrder: 'asc' } },
                relatedCompetencies: {
                    include: { relatedCompetency: true }
                }
            }
        });

        if (!competency) {
            return NextResponse.json(
                { success: false, error: 'Competency not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: {
                ...competency,
                applicableRoles: competency.applicableRoles.map(r => r.roleName),
                relatedCompetencies: competency.relatedCompetencies.map(r => r.relatedCompetency)
            }
        });
    } catch (error) {
        console.error('Error fetching competency:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch competency' },
            { status: 500 }
        );
    }
}

// PUT - Update competency
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const {
            name,
            categoryId,
            subcategoryId,
            description,
            status,
            version,
            owner,
            applicableRoles,
            proficiencyDescriptors,
            developmentResources,
            assessmentCriteria
        } = body;

        // Update main competency data
        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (categoryId !== undefined) updateData.categoryId = categoryId;
        if (subcategoryId !== undefined) updateData.subcategoryId = subcategoryId;
        if (description !== undefined) updateData.description = description;
        if (status !== undefined) updateData.status = status;
        if (version !== undefined) updateData.version = version;
        if (owner !== undefined) updateData.owner = owner;

        // Handle related data updates
        if (applicableRoles !== undefined) {
            await prisma.competencyRoleMapping.deleteMany({ where: { competencyId: id } });
            if (applicableRoles.length > 0) {
                await prisma.competencyRoleMapping.createMany({
                    data: applicableRoles.map((role: string) => ({
                        competencyId: id,
                        roleName: role
                    }))
                });
            }
        }

        if (proficiencyDescriptors !== undefined) {
            await prisma.competencyProficiencyDescriptor.deleteMany({ where: { competencyId: id } });
            if (proficiencyDescriptors.length > 0) {
                await prisma.competencyProficiencyDescriptor.createMany({
                    data: proficiencyDescriptors.map((desc: any) => ({
                        competencyId: id,
                        levelId: desc.levelId,
                        description: desc.description,
                        behaviors: desc.behaviors
                    }))
                });
            }
        }

        if (developmentResources !== undefined) {
            await prisma.competencyDevelopmentResource.deleteMany({ where: { competencyId: id } });
            if (developmentResources.length > 0) {
                await prisma.competencyDevelopmentResource.createMany({
                    data: developmentResources.map((res: any) => ({
                        competencyId: id,
                        title: res.title,
                        type: res.type,
                        url: res.url,
                        provider: res.provider,
                        duration: res.duration,
                        cost: res.cost
                    }))
                });
            }
        }

        if (assessmentCriteria !== undefined) {
            await prisma.competencyAssessmentCriteria.deleteMany({ where: { competencyId: id } });
            if (assessmentCriteria.length > 0) {
                await prisma.competencyAssessmentCriteria.createMany({
                    data: assessmentCriteria.map((crit: any, idx: number) => ({
                        competencyId: id,
                        criteria: typeof crit === 'string' ? crit : crit.criteria,
                        sortOrder: idx
                    }))
                });
            }
        }

        const competency = await prisma.competencyCatalog.update({
            where: { id },
            data: updateData,
            include: {
                category: true,
                subcategory: true,
                proficiencyDescriptors: { include: { level: true } },
                applicableRoles: true,
                developmentResources: true,
                assessmentCriteria: true
            }
        });

        return NextResponse.json({
            success: true,
            data: {
                ...competency,
                applicableRoles: competency.applicableRoles.map(r => r.roleName)
            },
            message: 'Competency updated successfully'
        });
    } catch (error) {
        console.error('Error updating competency:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update competency' },
            { status: 500 }
        );
    }
}

// DELETE - Delete competency
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Check if competency is in use
        const usageCount = await prisma.jobCompetencyMapping.count({
            where: { competencyId: id }
        });

        if (usageCount > 0) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: `Cannot delete: Competency is mapped to ${usageCount} job role(s)` 
                },
                { status: 400 }
            );
        }

        await prisma.competencyCatalog.delete({ where: { id } });

        return NextResponse.json({
            success: true,
            message: 'Competency deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting competency:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete competency' },
            { status: 500 }
        );
    }
}
