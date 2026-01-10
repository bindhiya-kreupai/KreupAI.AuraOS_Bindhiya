import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

// GET - Fetch single framework by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const framework = await prisma.proficiencyFramework.findUnique({
            where: { id },
            include: {
                levels: {
                    orderBy: { levelNumber: 'asc' }
                }
            }
        });

        if (!framework) {
            return NextResponse.json(
                { success: false, error: 'Framework not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: framework
        });
    } catch (error) {
        logger.error('Error fetching framework:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch framework' },
            { status: 500 }
        );
    }
}

// PUT - Update framework
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();
        const { name, description, type, status, levels } = body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (type !== undefined) updateData.type = type;
        if (status !== undefined) updateData.status = status;

        // Update levels if provided
        if (levels !== undefined) {
            // Delete existing levels
            await prisma.proficiencyLevel.deleteMany({
                where: { frameworkId: id }
            });

            // Create new levels
            if (levels.length > 0) {
                await prisma.proficiencyLevel.createMany({
                    data: levels.map((level: any, index: number) => ({
                        frameworkId: id,
                        code: level.code || `L${index + 1}`,
                        name: level.name,
                        levelNumber: level.levelNumber || index + 1,
                        description: level.description,
                        color: level.color,
                        icon: level.icon
                    }))
                });
            }
        }

        const framework = await prisma.proficiencyFramework.update({
            where: { id },
            data: updateData,
            include: {
                levels: {
                    orderBy: { levelNumber: 'asc' }
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: framework,
            message: 'Framework updated successfully'
        });
    } catch (error) {
        logger.error('Error updating framework:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update framework' },
            { status: 500 }
        );
    }
}

// DELETE - Delete framework
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        // Check if framework is default
        const framework = await prisma.proficiencyFramework.findUnique({
            where: { id }
        });

        if (framework?.isDefault) {
            return NextResponse.json(
                { success: false, error: 'Cannot delete the default framework' },
                { status: 400 }
            );
        }

        // Check if framework is in use
        const usageCount = await prisma.competencyProficiencyDescriptor.count({
            where: {
                level: { frameworkId: id }
            }
        });

        if (usageCount > 0) {
            return NextResponse.json(
                { 
                    success: false, 
                    error: `Cannot delete: Framework is used by ${usageCount} competency descriptor(s)` 
                },
                { status: 400 }
            );
        }

        await prisma.proficiencyFramework.delete({ where: { id } });

        return NextResponse.json({
            success: true,
            message: 'Framework deleted successfully'
        });
    } catch (error) {
        logger.error('Error deleting framework:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete framework' },
            { status: 500 }
        );
    }
}
