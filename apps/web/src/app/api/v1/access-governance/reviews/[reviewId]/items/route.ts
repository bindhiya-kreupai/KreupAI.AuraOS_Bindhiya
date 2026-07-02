import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbiddenResponse, mapReviewItemToApi, type ReviewItemRow } from '../../../_shared';

/**
 * GET /api/v1/access-governance/reviews/[reviewId]/items -> AccessReviewItem[]
 */
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('access-governance:read')) {
      return forbiddenResponse('access-governance:read');
    }
    const tenantId = user.tenantId;
    const campaignId = params?.reviewId;

    const rows: ReviewItemRow[] = await (prisma as any).accessReviewItem.findMany({
      where: { tenantId, campaignId, isDeleted: false },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(rows.map(mapReviewItemToApi));
  } catch (error: any) {
    logger.error(
      { err: error, route: 'access-governance/reviews/[reviewId]/items' },
      'Failed to list review items'
    );
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to list review items',
          messageAr: 'فشل في جلب عناصر المراجعة',
        },
      },
      { status: 500 }
    );
  }
});
