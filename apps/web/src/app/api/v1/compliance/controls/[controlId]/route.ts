import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, notFound, serverError } from '@/lib/api/crud-helpers';
import { mapControl } from '../../_lib/compliance-mappers';

/**
 * GET /api/v1/compliance/controls/[controlId]
 * Returns the ComplianceControl (with evidence + tests) as a bare object.
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, params, permissions } = context;
    if (!permissions.includes('compliance/controls:read')) {
      return forbidden('compliance/controls:read');
    }

    const controlId = params?.controlId;
    if (!controlId) return notFound('Compliance control');

    const row = await (prisma as any).complianceControl.findFirst({
      where: {
        tenantId: user.tenantId,
        isDeleted: false,
        OR: [{ id: controlId }, { code: controlId }],
      },
      include: {
        evidence: { where: { isDeleted: false }, orderBy: { createdAt: 'desc' } },
        tests: { where: { isDeleted: false }, orderBy: { runAt: 'desc' } },
      },
    });

    if (!row) return notFound('Compliance control');

    return NextResponse.json(mapControl(row));
  } catch (error: any) {
    logger.error(
      { err: error, route: 'v1/compliance/controls/[controlId]/route.ts' },
      'Failed to get control'
    );
    return serverError(error, 'get compliance control');
  }
});
