import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbiddenResponse, mapRuleToApi, seedDefaultRules, type SodRuleRow } from '../_shared';

/**
 * GET /api/v1/access-governance/sod-rules -> SoDRule[]
 * Seeds a couple of default rules idempotently when the tenant has none.
 */
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('access-governance:read')) {
      return forbiddenResponse('access-governance:read');
    }
    const tenantId = user.tenantId;

    let rules: SodRuleRow[] = await (prisma as any).sodRule.findMany({
      where: { tenantId, isDeleted: false },
      include: { violations: { where: { status: 'open', isDeleted: false } } },
      orderBy: { createdAt: 'desc' },
    });

    if (rules.length === 0) {
      await seedDefaultRules(tenantId, user.userId);
      rules = await (prisma as any).sodRule.findMany({
        where: { tenantId, isDeleted: false },
        include: { violations: { where: { status: 'open', isDeleted: false } } },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json(rules.map(mapRuleToApi));
  } catch (error: any) {
    logger.error({ err: error, route: 'access-governance/sod-rules' }, 'Failed to list SoD rules');
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to list SoD rules',
          messageAr: 'فشل في جلب القواعد',
        },
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/v1/access-governance/sod-rules -> SoDRule (body CreateSoDRuleInput)
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('access-governance:create')) {
      return forbiddenResponse('access-governance:create');
    }
    const tenantId = user.tenantId;

    const body = await request.json().catch(() => null);
    if (!body || !body.name || !body.entityA || !body.entityB) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'E4000',
            message: 'name, entityA and entityB are required',
            messageAr: 'الاسم والكيان أ والكيان ب مطلوبة',
          },
        },
        { status: 400 }
      );
    }

    const created: SodRuleRow = await (prisma as any).sodRule.create({
      data: {
        tenantId,
        name: body.name,
        description: body.description ?? '',
        category: body.conflictType ?? 'role-role',
        riskLevel: body.severity ?? 'high',
        conflictingRoles: {
          entityA: body.entityA,
          entityB: body.entityB,
          rationale: body.rationale ?? '',
          exceptionProcess: body.exceptionProcess ?? undefined,
        },
        isActive: true,
        createdBy: user.userId,
        updatedBy: user.userId,
      },
    });

    return NextResponse.json(mapRuleToApi({ ...created, violations: [] }));
  } catch (error: any) {
    logger.error({ err: error, route: 'access-governance/sod-rules' }, 'Failed to create SoD rule');
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to create SoD rule',
          messageAr: 'فشل في إنشاء القاعدة',
        },
      },
      { status: 500 }
    );
  }
});
