import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, notFound, serverError, successItem } from '@/lib/api/crud-helpers';

/**
 * POST /api/security/policy-acknowledgement/[policyId]/remind
 * Records that reminders were sent to employees who have not yet acknowledged
 * the policy. Writes an audit log row and returns the number targeted.
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/policy:update')) return forbidden('security/policy:update');

    // .../policy-acknowledgement/<policyId>/remind
    const segments = new URL(request.url).pathname.split('/').filter(Boolean);
    const policyId = segments[segments.length - 2];
    if (!policyId) return notFound('Policy');

    const policy = await (prisma as any).policyDocument.findFirst({
      where: { id: policyId, tenantId: user.tenantId, isDeleted: false },
    });
    if (!policy) return notFound('Policy');

    const [totalRequired, acknowledgedCount] = await Promise.all([
      (prisma as any).employee.count({
        where: { isDeleted: false, status: { is: { status: 'Active' } } },
      }),
      (prisma as any).policyAcknowledgement.count({
        where: { tenantId: user.tenantId, policyId, isDeleted: false },
      }),
    ]);
    const pendingCount = Math.max(0, totalRequired - acknowledgedCount);

    await (prisma as any).auditLog.create({
      data: {
        tenantId: user.tenantId,
        userId: user.userId,
        action: 'SETTINGS_UPDATED',
        module: 'security',
        details: `Policy reminder sent for "${policy.title}" to ${pendingCount} pending employee(s)`,
        entityType: 'PolicyDocument',
        entityId: policyId,
        severity: 'LOW',
      },
    });

    return successItem({ sent: pendingCount, policyId });
  } catch (error: any) {
    logger.error(
      { err: error, route: 'security/policy-acknowledgement/[policyId]/remind/route.ts' },
      'Failed to send reminders'
    );
    return serverError(error, 'send reminders');
  }
});
