import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, serverError, successList } from '@/lib/api/crud-helpers';

/**
 * List points transactions. Defaults to the current user unless a userId query
 * param is supplied (still tenant-scoped, so no cross-tenant leakage).
 */
export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const url = new URL(request.url);
    const employeeId = url.searchParams.get('userId') || user.userId;
    const rows = await (prisma as any).gamificationPointsTransaction.findMany({
      where: { tenantId: user.tenantId, employeeId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    const data = rows.map((r: any) => ({
      transactionId: r.id,
      userId: r.employeeId,
      transactionType: r.type,
      type: r.amount >= 0 ? 'earn' : 'redeem',
      pointsAmount: r.amount,
      amount: `${r.amount >= 0 ? '+' : ''}${r.amount}`,
      pointsBalance: r.balanceAfter,
      category: r.category,
      source: r.source,
      title: r.reason || r.source,
      reason: r.reason,
      date: r.createdAt,
      transactionDate: r.createdAt,
    }));
    return successList(data, 1, data.length || 1, data.length);
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/points/transactions' }, 'Failed to list');
    return serverError(error, 'list');
  }
});
