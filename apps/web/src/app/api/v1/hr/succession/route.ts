import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@/lib/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/hr/succession
 * Get succession plans for key positions
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  const { permissions } = context;
  if (!permissions.includes('hr/succession:read')) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E4030',
          message: 'Forbidden: missing hr/succession:read permission',
          messageAr: 'ممنوع',
        },
      },
      { status: 403 }
    );
  }
  try {
    const { _user } = context;
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const positionId = searchParams.get('positionId') || undefined;
    const status = searchParams.get('status') || undefined;
    const departmentId = searchParams.get('departmentId') || undefined;

    // Build positions query to find key positions with succession plans
    const positionWhere: Record<string, unknown> = {
      isDeleted: false,
    };
    if (positionId) positionWhere.id = positionId;
    if (departmentId) positionWhere.departmentId = departmentId;
    if (status) positionWhere.successionStatus = status;

    const [positions, total] = await Promise.all([
      prisma.position.findMany({
        where: positionWhere,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          department: { select: { id: true, name: true } },
          jobProfile: { select: { id: true, title: true, code: true } },
          grade: { select: { id: true, name: true, level: true } },
          currentEmployee: {
            select: { id: true, firstName: true, lastName: true, employeeCode: true },
          },
        },
      }),
      prisma.position.count({ where: positionWhere }),
    ]);

    // Enrich with succession data (mock successors since there's no SuccessionPlan model yet)
    const successionPlans = positions.map((position) => ({
      positionId: position.id,
      positionTitle: position.jobProfile?.title || position.title,
      department: position.department,
      grade: position.grade,
      incumbent: position.currentEmployee,
      riskLevel: position.isKeyPosition ? 'HIGH' : 'MEDIUM',
      retentionRisk: 'MEDIUM',
      successors: [], // Would be populated from a SuccessionPlanSuccessor model
      lastReviewDate: position.updatedAt,
      nextReviewDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    }));

    return NextResponse.json({
      success: true,
      data: successionPlans,
      meta: {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[Succession API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch succession plans' } },
      { status: 500 }
    );
  }
});
