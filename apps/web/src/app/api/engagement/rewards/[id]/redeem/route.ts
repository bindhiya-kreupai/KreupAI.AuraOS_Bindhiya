import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  forbidden,
  notFound,
  serverError,
  successItem,
  validationError,
} from '@/lib/api/crud-helpers';

/**
 * Redeem a reward for the current user. Verifies the point balance
 * (recognitions received minus prior redemptions), records a redemption row,
 * and decrements stock when tracked.
 */
export const POST = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions, params } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const rewardId = params?.id as string;
    if (!rewardId) return notFound('Reward');

    const reward = await (prisma as any).engagementReward.findFirst({
      where: { id: rewardId, tenantId: user.tenantId, isActive: true },
    });
    if (!reward) return notFound('Reward');

    if (typeof reward.stock === 'number' && reward.stock <= 0) {
      return validationError({ message: 'Reward out of stock', messageAr: 'المكافأة غير متوفرة' });
    }

    const [earned, redeemed] = await Promise.all([
      prisma.recognition.aggregate({
        where: { tenantId: user.tenantId, receiverId: user.userId, isDeleted: false },
        _sum: { points: true },
      }),
      (prisma as any).engagementRewardRedemption.aggregate({
        where: { tenantId: user.tenantId, employeeId: user.userId, status: { not: 'REJECTED' } },
        _sum: { pointsCost: true },
      }),
    ]);
    const balance = Math.max(0, (earned._sum.points || 0) - (redeemed._sum.pointsCost || 0));

    if (balance < reward.pointsCost) {
      return validationError({
        message: 'Insufficient points to redeem this reward',
        messageAr: 'نقاط غير كافية لاستبدال هذه المكافأة',
      });
    }

    await (prisma as any).engagementRewardRedemption.create({
      data: {
        tenantId: user.tenantId,
        rewardId,
        employeeId: user.userId,
        pointsCost: reward.pointsCost,
        status: 'PENDING',
      },
    });

    if (typeof reward.stock === 'number') {
      await (prisma as any).engagementReward.update({
        where: { id: rewardId },
        data: { stock: { decrement: 1 } },
      });
    }

    const newBalance = balance - reward.pointsCost;
    return successItem({ balance: newBalance, redeemed: reward.pointsCost });
  } catch (error: any) {
    logger.error({ err: error, route: 'engagement/rewards/[id]/redeem' }, 'Failed');
    return serverError(error, 'redeem');
  }
});
