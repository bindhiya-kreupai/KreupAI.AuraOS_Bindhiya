import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/compliance/gosi/submissions
 * Get GOSI submission history
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('compliance/gosi:read')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4030',
            message: 'Forbidden: missing compliance/gosi:read permission',
            messageAr: 'ممنوع',
          },
        },
        { status: 403 }
      );
    }
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const skip = (page - 1) * limit;

    const status = searchParams.get('status') || undefined;
    const contributionMonth = searchParams.get('contributionMonth') || undefined;

    const where: Record<string, unknown> = { tenantId: user.tenantId };
    if (status) where.status = status;
    if (contributionMonth) where.contributionMonth = contributionMonth;

    const [data, total] = await Promise.all([
      prisma.gOSISubmission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          gosiConfig: { select: { gosiSubscriptionNumber: true } },
          _count: { select: { records: true } },
        },
      }),
      prisma.gOSISubmission.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data,
      meta: {
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        apiVersion: 'v1',
      },
    });
  } catch (error: any) {
    console.error('[GOSI Submissions API] GET Error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'E5001', message: 'Failed to fetch GOSI submissions' } },
      { status: 500 }
    );
  }
});
