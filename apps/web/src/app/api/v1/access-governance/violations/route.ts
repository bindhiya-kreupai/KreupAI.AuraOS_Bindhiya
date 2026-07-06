import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbiddenResponse, mapViolationToApi, type SodViolationRow } from '../_shared';

/**
 * GET /api/v1/access-governance/violations -> SoDViolation[]
 */
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('access-governance:read')) {
      return forbiddenResponse('access-governance:read');
    }
    const tenantId = user.tenantId;

    const rows: SodViolationRow[] = await (prisma as any).sodViolation.findMany({
      where: { tenantId, isDeleted: false },
      include: { rule: true },
      orderBy: { detectedAt: 'desc' },
    });

    return NextResponse.json(rows.map(mapViolationToApi));
  } catch (error: any) {
    logger.error(
      { err: error, route: 'access-governance/violations' },
      'Failed to list violations'
    );
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'E5001',
          message: 'Failed to list violations',
          messageAr: 'فشل في جلب المخالفات',
        },
      },
      { status: 500 }
    );
  }
});
