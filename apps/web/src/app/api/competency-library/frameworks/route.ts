import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

// GET - Fetch all proficiency frameworks
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeInactive = searchParams.get('includeInactive') === 'true';

        const where = includeInactive ? {} : { status: 'Active' };

        const frameworks = await prisma.proficiencyFramework.findMany({
            where,
            include: {
                levels: {
                    orderBy: { levelNumber: 'asc' }
                }
            },
            orderBy: [
                { isDefault: 'desc' },
                { name: 'asc' }
            ]
        });

        return NextResponse.json({
            success: true,
            data: frameworks
        });
    } catch {
        logger.error('Error fetching frameworks:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch proficiency frameworks' },
            { status: 500 }
        );
    }
}

// POST - Create a new proficiency framework
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, name, description, type = 'Custom', levels = [] } = body;

        // Generate code if not provided
        const finalCode = code || `FW-${Date.now()}`;

        const framework = await prisma.proficiencyFramework.create({
            data: {
                code: finalCode,
                name,
                description,
                type,
                levels: {
                    create: levels.map((level: any, index: number) => ({
                        code: level.code || `L${index + 1}`,
                        name: level.name,
                        levelNumber: level.levelNumber || index + 1,
                        description: level.description,
                        color: level.color,
                        icon: level.icon
                    }))
                }
            },
            include: {
                levels: {
                    orderBy: { levelNumber: 'asc' }
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: framework,
            message: 'Proficiency framework created successfully'
        });
    } catch (error: any) {
        logger.error('Error creating framework:', error);
        if (error.code === 'P2002') {
            return NextResponse.json(
                { success: false, error: 'A framework with this code already exists' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Failed to create framework' },
            { status: 500 }
        );
    }
}
