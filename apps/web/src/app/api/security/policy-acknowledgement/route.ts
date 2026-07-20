import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, parsePagination, serverError, successList } from '@/lib/api/crud-helpers';

/**
 * GET /api/security/policy-acknowledgement
 * Lists tenant policies with per-policy acknowledgement stats plus an aggregate
 * meta summary (overall compliance %, total policies, pending count).
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('security/policy:read')) return forbidden('security/policy:read');

    const { page, limit, skip } = parsePagination(new URL(request.url).searchParams);
    const where = { tenantId: user.tenantId, isDeleted: false };

    // Active headcount = required acknowledgements per policy.
    const totalRequired = await (prisma as any).employee.count({
      where: { isDeleted: false, status: { is: { status: 'Active' } } },
    });

    const [policies, total] = await Promise.all([
      (prisma as any).policyDocument.findMany({
        where,
        orderBy: { effectiveDate: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).policyDocument.count({ where }),
    ]);

    const summaries = await Promise.all(
      policies.map(async (p: any) => {
        const acknowledgedCount = await (prisma as any).policyAcknowledgement.count({
          where: { tenantId: user.tenantId, policyId: p.id, isDeleted: false },
        });
        const pendingCount = Math.max(0, totalRequired - acknowledgedCount);
        const percentage =
          totalRequired > 0 ? Math.round((acknowledgedCount / totalRequired) * 100) : 0;
        return {
          id: p.id,
          title: p.title,
          category: p.category,
          version: p.version,
          status: p.status,
          effectiveDate: p.effectiveDate,
          acknowledgementsRequired: p.acknowledgementsRequired,
          acknowledgedCount,
          totalRequired,
          pendingCount,
          percentage,
        };
      })
    );

    // Aggregate across all tenant policies (not just current page) for the stat cards.
    const allPolicies = await (prisma as any).policyDocument.findMany({
      where,
      select: { id: true },
    });
    let ackTotal = 0;
    for (const p of allPolicies) {
      ackTotal += await (prisma as any).policyAcknowledgement.count({
        where: { tenantId: user.tenantId, policyId: p.id, isDeleted: false },
      });
    }
    const requiredTotal = allPolicies.length * totalRequired;
    const overallPct = requiredTotal > 0 ? Math.round((ackTotal / requiredTotal) * 100) : 0;
    const pendingCount = Math.max(0, requiredTotal - ackTotal);

    return successList(summaries, page, limit, total, {
      overallPct,
      totalPolicies: allPolicies.length,
      pendingCount,
      totalRequired,
    });
  } catch (error: any) {
    logger.error(
      { err: error, route: 'security/policy-acknowledgement/route.ts' },
      'Failed to list policies'
    );
    return serverError(error, 'list policies');
  }
});
