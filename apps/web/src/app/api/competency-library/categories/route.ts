import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { logger } from '@/lib/logger';

// GET - Fetch all competency categories
export async function GET(request: NextRequest) {
    try {
        const categories = await prisma.competencyCategory.findMany({
            where: { status: 'Active' },
            include: {
                subcategories: {
                    where: { status: 'Active' },
                    orderBy: { name: 'asc' }
                },
                _count: {
                    select: { competencies: true }
                }
            },
            orderBy: { sortOrder: 'asc' }
        });

        const transformed = categories.map(cat => ({
            ...cat,
            competencyCount: cat._count.competencies
        }));

        return NextResponse.json({
            success: true,
            data: transformed
        });
    } catch (error) {
        logger.error('Error fetching categories:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

// POST - Create a new category
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, name, description, icon, color, sortOrder } = body;

        const category = await prisma.competencyCategory.create({
            data: {
                code,
                name,
                description,
                icon,
                color,
                sortOrder: sortOrder || 0
            },
            include: {
                subcategories: true
            }
        });

        return NextResponse.json({
            success: true,
            data: category,
            message: 'Category created successfully'
        });
    } catch (error: any) {
        logger.error('Error creating category:', error);
        if (error.code === 'P2002') {
            return NextResponse.json(
                { success: false, error: 'A category with this code already exists' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, error: 'Failed to create category' },
            { status: 500 }
        );
    }
}
