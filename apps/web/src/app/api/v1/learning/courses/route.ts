import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/learning/courses
 * Get the learning course catalog
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { _user } = context;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const category = searchParams.get('category') || undefined;
    const level = searchParams.get('level') || undefined;
    const status = searchParams.get('status') || 'PUBLISHED';
    const search = searchParams.get('search') || undefined;
    const isMandatory = searchParams.get('isMandatory');

    const where: Record<string, unknown> = { status };
    if (category) where.category = category;
    if (level) where.level = level;
    if (isMandatory !== null && isMandatory !== undefined)
      where.isMandatory = isMandatory === 'true';
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { enrollments: true, modules: true } },
        },
      }),
      prisma.course.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      meta: {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        filters: {
          categories: ['TECHNICAL', 'LEADERSHIP', 'COMPLIANCE', 'SOFT_SKILLS', 'ONBOARDING'],
          levels: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'],
        },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (_error) {
    console.error('[Learning Courses API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch course catalog' } },
      { status: 500 }
    );
  }
});
