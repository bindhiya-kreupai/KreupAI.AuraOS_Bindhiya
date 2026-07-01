import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, notFound, serverError } from '@/lib/api/crud-helpers';
import { mapFramework } from '../../_lib/compliance-mappers';

/**
 * GET /api/v1/compliance/frameworks/[frameworkId]
 * Resolves by DB id OR framework code. Returns the ComplianceFramework (with
 * controls) as a bare object — no {success,data} wrapper.
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('compliance/frameworks:read')) {
      return forbidden('compliance/frameworks:read');
    }

    const frameworkId = params?.frameworkId;
    if (!frameworkId) return notFound('Compliance framework');

    const row = await (prisma as any).complianceFramework.findFirst({
      where: {
        tenantId: user.tenantId,
        isDeleted: false,
        OR: [{ id: frameworkId }, { code: frameworkId }],
      },
      include: {
        controls: {
          where: { isDeleted: false },
          include: {
            evidence: { where: { isDeleted: false }, orderBy: { createdAt: 'desc' } },
            tests: { where: { isDeleted: false }, orderBy: { runAt: 'desc' } },
          },
        },
      },
    });

    if (!row) return notFound('Compliance framework');

    return NextResponse.json(mapFramework(row));
  } catch (error: any) {
    logger.error(
      { err: error, route: 'v1/compliance/frameworks/[frameworkId]/route.ts' },
      'Failed to get framework'
    );
    return serverError(error, 'get compliance framework');
  }
});
