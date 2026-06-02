import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, serverError, successItem } from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('helpdesk:read')) return forbidden('helpdesk:read');
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [total, open, resolved, byCategory, byPriority] = await Promise.all([
      prisma.helpdeskTicket.count({
        where: { tenantId: user.tenantId, createdAt: { gte: since } },
      }),
      prisma.helpdeskTicket.count({
        where: { tenantId: user.tenantId, status: { in: ['OPEN', 'IN_PROGRESS'] } },
      }),
      prisma.helpdeskTicket.count({ where: { tenantId: user.tenantId, status: 'RESOLVED' } }),
      prisma.helpdeskTicket.groupBy({
        by: ['category'],
        where: { tenantId: user.tenantId, createdAt: { gte: since } },
        _count: { _all: true },
      }),
      prisma.helpdeskTicket.groupBy({
        by: ['priority'],
        where: { tenantId: user.tenantId, createdAt: { gte: since } },
        _count: { _all: true },
      }),
    ]);
    return successItem({
      windowDays: 30,
      total,
      open,
      resolved,
      byCategory: byCategory.map((b) => ({ category: b.category, count: b._count._all })),
      byPriority: byPriority.map((b) => ({ priority: b.priority, count: b._count._all })),
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return serverError(error, 'compute helpdesk analytics');
  }
});
