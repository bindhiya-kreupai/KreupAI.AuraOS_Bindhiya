import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { forbidden, serverError, successItem } from '@/lib/api/crud-helpers';

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('recognition:read')) return forbidden('recognition:read');
    const sp = new URL(request.url).searchParams;
    const period = sp.get('period') || 'all';
    const since =
      period === 'month'
        ? new Date(new Date().setDate(new Date().getDate() - 30))
        : period === 'quarter'
          ? new Date(new Date().setDate(new Date().getDate() - 90))
          : period === 'year'
            ? new Date(new Date().setDate(new Date().getDate() - 365))
            : null;
    const rows = await prisma.recognition.groupBy({
      by: ['receiverId'],
      where: { tenantId: user.tenantId, ...(since ? { createdAt: { gte: since } } : {}) },
      _count: { receiverId: true },
      _sum: { points: true },
      orderBy: { _sum: { points: 'desc' } },
      take: 50,
    });
    return successItem({
      period,
      leaderboard: rows.map((r) => ({
        receiverId: r.receiverId,
        recognitions: r._count.receiverId,
        totalPoints: r._sum.points || 0,
      })),
    });
  } catch (error: any) {
    return serverError(error, 'fetch leaderboard');
  }
});
