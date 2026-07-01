import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbiddenResponse, mapReviewItemToApi, type ReviewItemRow } from '../../../_shared';
import { applyReviewDecision } from '../../_decision';

/**
 * POST /api/v1/access-governance/review-items/[itemId]/approve -> AccessReviewItem (body {comment?})
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('access-governance:create')) {
      return forbiddenResponse('access-governance:create');
    }
    const body = await request.json().catch(() => ({}));

    const updated: ReviewItemRow | null = await applyReviewDecision({
      itemId: params?.itemId,
      tenantId: user.tenantId,
      userId: user.userId,
      decision: 'approved',
      comment: body?.comment,
    });

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4040',
            message: 'Review item not found',
            messageAr: 'عنصر المراجعة غير موجود',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(mapReviewItemToApi(updated));
  } catch (error: any) {
    logger.error(
      { err: error, route: 'access-governance/review-items/[itemId]/approve' },
      'Failed to approve item'
    );
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to approve review item',
          messageAr: 'فشل في اعتماد عنصر المراجعة',
        },
      },
      { status: 500 }
    );
  }
});
