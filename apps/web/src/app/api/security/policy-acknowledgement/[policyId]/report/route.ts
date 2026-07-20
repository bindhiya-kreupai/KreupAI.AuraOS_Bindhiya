import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, notFound, serverError, successItem } from '@/lib/api/crud-helpers';

/**
 * GET /api/security/policy-acknowledgement/[policyId]/report
 * Returns acknowledged vs pending employees for a single policy.
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/policy:read')) return forbidden('security/policy:read');

    // .../policy-acknowledgement/<policyId>/report
    const segments = new URL(request.url).pathname.split('/').filter(Boolean);
    const policyId = segments[segments.length - 2];
    if (!policyId) return notFound('Policy');

    const policy = await (prisma as any).policyDocument.findFirst({
      where: { id: policyId, tenantId: user.tenantId, isDeleted: false },
    });
    if (!policy) return notFound('Policy');

    const [employees, acks] = await Promise.all([
      (prisma as any).employee.findMany({
        where: { isDeleted: false, status: { is: { status: 'Active' } } },
        select: {
          id: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      }),
      (prisma as any).policyAcknowledgement.findMany({
        where: { tenantId: user.tenantId, policyId, isDeleted: false },
        select: { employeeId: true, acknowledgedAt: true },
      }),
    ]);

    const ackMap = new Map<string, Date>();
    for (const a of acks) ackMap.set(a.employeeId, a.acknowledgedAt);

    const acknowledged: any[] = [];
    const pending: any[] = [];
    for (const e of employees) {
      const row = {
        employeeId: e.id,
        employeeCode: e.employeeCode,
        name: `${e.firstName} ${e.lastName}`.trim(),
        email: e.email,
      };
      if (ackMap.has(e.id)) {
        acknowledged.push({ ...row, acknowledgedAt: ackMap.get(e.id) });
      } else {
        pending.push(row);
      }
    }

    return successItem({
      policy: {
        id: policy.id,
        title: policy.title,
        version: policy.version,
        effectiveDate: policy.effectiveDate,
      },
      acknowledged,
      pending,
      acknowledgedCount: acknowledged.length,
      pendingCount: pending.length,
    });
  } catch (error: any) {
    logger.error(
      { err: error, route: 'security/policy-acknowledgement/[policyId]/report/route.ts' },
      'Failed to build report'
    );
    return serverError(error, 'build report');
  }
});
