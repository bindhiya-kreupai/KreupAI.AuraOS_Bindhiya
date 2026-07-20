/**
 * Reward redemption API — backed by aura_reward_redemption + aura_reward_point_ledger.
 * Redeeming a reward: verifies the catalog item, checks the employee's derived
 * point balance, records a redemption row and a negative ledger entry atomically.
 * The employee is always the authenticated user — never trusted from the client.
 */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { prisma } from '@aura/database';
import { z } from 'zod';

const redeemSchema = z.object({
  rewardId: z.string().min(1, 'rewardId is required'),
});

function currentActor(user: { userId: string; employeeId?: string }): string {
  return user.employeeId || user.userId;
}

function err(code: string, message: string, messageAr: string, status: number, details?: unknown) {
  return NextResponse.json(
    { success: false, error: { code, message, messageAr, ...(details ? { details } : {}) } },
    { status }
  );
}

export const GET = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const actorId = currentActor(user);
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const skip = (page - 1) * limit;
    const where = { tenantId: user.tenantId, employeeId: actorId };

    const [rows, total] = await Promise.all([
      (prisma as any).rewardRedemption.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      (prisma as any).rewardRedemption.count({ where }),
    ]);

    return NextResponse.json({
      items: rows,
      total,
      page,
      pageSize: limit,
      hasNextPage: skip + rows.length < total,
    });
  } catch (error) {
    return err('E5001', 'Failed to fetch redemptions', 'فشل في جلب عمليات الاسترداد', 500);
  }
});

export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user } = context;
    const actorId = currentActor(user);
    const body = await request.json().catch(() => null);
    if (!body) return err('E2001', 'Invalid JSON body', 'نص الطلب غير صالح', 400);

    const parsed = redeemSchema.safeParse(body);
    if (!parsed.success) {
      return err('E2001', 'Validation failed', 'فشل التحقق من الصحة', 400, parsed.error.errors);
    }

    const reward = await (prisma as any).rewardCatalog.findFirst({
      where: {
        id: parsed.data.rewardId,
        tenantId: user.tenantId,
        isDeleted: false,
        isActive: true,
      },
    });
    if (!reward) return err('E4004', 'Reward not found', 'المكافأة غير موجودة', 404);

    const agg = await (prisma as any).rewardPointLedger.aggregate({
      where: { tenantId: user.tenantId, employeeId: actorId },
      _sum: { points: true },
    });
    const balance = agg?._sum?.points ?? 0;
    if (balance < reward.cost) {
      return err('E4009', 'Insufficient points balance', 'رصيد النقاط غير كافٍ', 409, {
        balance,
        cost: reward.cost,
      });
    }

    const [redemption] = await prisma.$transaction([
      (prisma as any).rewardRedemption.create({
        data: {
          tenantId: user.tenantId,
          employeeId: actorId,
          rewardId: reward.id,
          rewardName: reward.name,
          cost: reward.cost,
          status: 'pending',
        },
      }),
      (prisma as any).rewardPointLedger.create({
        data: {
          tenantId: user.tenantId,
          employeeId: actorId,
          points: -reward.cost,
          reason: `Redeemed: ${reward.name}`,
          source: 'redemption',
          referenceId: reward.id,
          createdBy: user.userId,
        },
      }),
    ]);

    return NextResponse.json({ item: redemption, balance: balance - reward.cost }, { status: 201 });
  } catch (error) {
    return err('E5001', 'Failed to redeem reward', 'فشل في استرداد المكافأة', 500);
  }
});
