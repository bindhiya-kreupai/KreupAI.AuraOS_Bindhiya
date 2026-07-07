import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbiddenResponse, mapRuleToApi, type SodRuleRow } from '../../_shared';

/**
 * PATCH /api/v1/access-governance/sod-rules/[id] -> SoDRule (body {isActive})
 */
export const PATCH = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('access-governance:create')) {
      return forbiddenResponse('access-governance:create');
    }
    const tenantId = user.tenantId;
    const id = params?.id;

    const existing = await (prisma as any).sodRule.findFirst({ where: { id, tenantId } });
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'E4040', message: 'SoD rule not found', messageAr: 'القاعدة غير موجودة' },
        },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const updated: SodRuleRow = await (prisma as any).sodRule.update({
      where: { id },
      data: {
        ...(typeof body.isActive === 'boolean' ? { isActive: body.isActive } : {}),
        updatedBy: user.userId,
      },
      include: { violations: { where: { status: 'open', isDeleted: false } } },
    });

    return NextResponse.json(mapRuleToApi(updated));
  } catch (error: any) {
    logger.error(
      { err: error, route: 'access-governance/sod-rules/[id]' },
      'Failed to update SoD rule'
    );
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to update SoD rule',
          messageAr: 'فشل في تحديث القاعدة',
        },
      },
      { status: 500 }
    );
  }
});
