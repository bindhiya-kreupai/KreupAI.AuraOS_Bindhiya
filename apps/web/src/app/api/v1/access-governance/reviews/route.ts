import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbiddenResponse, mapCampaignToApi, type CampaignRow } from '../_shared';

/**
 * GET /api/v1/access-governance/reviews -> AccessReviewCampaign[]
 */
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('access-governance:read')) {
      return forbiddenResponse('access-governance:read');
    }
    const tenantId = user.tenantId;

    const rows: CampaignRow[] = await (prisma as any).accessReviewCampaign.findMany({
      where: { tenantId, isDeleted: false },
      include: { items: { where: { isDeleted: false }, select: { decision: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(rows.map(mapCampaignToApi));
  } catch (error: any) {
    logger.error({ err: error, route: 'access-governance/reviews' }, 'Failed to list campaigns');
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to list review campaigns',
          messageAr: 'فشل في جلب حملات المراجعة',
        },
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/access-governance/reviews -> AccessReviewCampaign (body CreateReviewCampaignInput)
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('access-governance:create')) {
      return forbiddenResponse('access-governance:create');
    }
    const tenantId = user.tenantId;

    const body = await request.json().catch(() => null);
    if (!body || !body.name) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E4000', message: 'name is required', messageAr: 'الاسم مطلوب' },
        },
        { status: 400 }
      );
    }

    const owners: string[] = Array.isArray(body.owners) ? body.owners : [];
    // scope stores reviewType when present so the type round-trips; otherwise targetScope.
    const scope = body.reviewType ?? body.targetScope ?? 'all';

    const created: CampaignRow = await (prisma as any).accessReviewCampaign.create({
      data: {
        tenantId,
        name: body.name,
        description: body.description ?? '',
        scope,
        status: 'draft',
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        reviewerName: owners[0] ?? null,
        totalItems: 0,
        reviewedItems: 0,
        startedAt: new Date(),
        createdBy: user.userId,
        updatedBy: user.userId,
      },
    });

    // targetScope is preserved on the mapped output; when scope stored the reviewType,
    // fold targetScope into description-independent field via the row's scope fallback.
    const mapped = mapCampaignToApi({ ...created, items: [] });
    if (body.targetScope && body.reviewType) {
      mapped.targetScope = body.targetScope;
    }
    if (owners.length > 0) {
      mapped.owners = owners;
    }

    return NextResponse.json(mapped);
  } catch (error: any) {
    logger.error({ err: error, route: 'access-governance/reviews' }, 'Failed to create campaign');
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to create review campaign',
          messageAr: 'فشل في إنشاء حملة المراجعة',
        },
      },
      { status: 500 }
    );
  }
});
