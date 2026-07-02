import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, serverError } from '@/lib/api/crud-helpers';
import { DEFAULT_FRAMEWORK_SEED, mapFramework } from '../_lib/compliance-mappers';

/**
 * GET /api/v1/compliance/frameworks
 * Returns ComplianceFramework[] (bare array — no {success,data} wrapper).
 * Seeds a default set (SOC 2, ISO 27001, GDPR) the first time a tenant has zero.
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('compliance/frameworks:read')) {
      return forbidden('compliance/frameworks:read');
    }

    const tenantId = user.tenantId;
    const count = await (prisma as any).complianceFramework.count({ where: { tenantId } });

    if (count === 0) {
      for (const fw of DEFAULT_FRAMEWORK_SEED) {
        const { controls, ...frameworkData } = fw;
        await (prisma as any).complianceFramework.create({
          data: {
            ...frameworkData,
            tenantId,
            createdBy: user.userId,
            updatedBy: user.userId,
            controls: {
              create: controls.map((c) => ({
                ...c,
                tenantId,
                createdBy: user.userId,
                updatedBy: user.userId,
              })),
            },
          },
        });
      }
    }

    const rows = await (prisma as any).complianceFramework.findMany({
      where: { tenantId, isDeleted: false },
      include: { controls: { where: { isDeleted: false } } },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(rows.map(mapFramework));
  } catch (error: any) {
    logger.error({ err: error, route: 'v1/compliance/frameworks/route.ts' }, 'Failed to list');
    return serverError(error, 'list compliance frameworks');
  }
});
