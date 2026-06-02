import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, serverError, successItem } from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('policy-mgmt:read')) return forbidden('policy-mgmt:read');
    const [totalPolicies, published, totalAck, byCategory] = await Promise.all([
      prisma.policyDocument.count({ where: { tenantId: user.tenantId } }),
      prisma.policyDocument.count({ where: { tenantId: user.tenantId, status: 'PUBLISHED' } }),
      prisma.policyAcknowledgement.count({ where: { tenantId: user.tenantId } }),
      prisma.policyDocument.groupBy({
        by: ['category'],
        where: { tenantId: user.tenantId },
        _count: { _all: true },
      }),
    ]);
    return successItem({
      totalPolicies,
      publishedPolicies: published,
      totalAcknowledgements: totalAck,
      byCategory: byCategory.map((b) => ({ category: b.category, count: b._count._all })),
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return serverError(error, 'compute policy analytics');
  }
});
