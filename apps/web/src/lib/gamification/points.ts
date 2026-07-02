/**
 * Gamification points helpers.
 * Shared logic for ensuring a tenant-scoped points account exists, awarding /
 * spending points atomically, and deriving the current level from a points
 * total. Kept server-only — used by the /api/gamification/* routes.
 */

import { prisma } from '@aura/database';

export interface LevelTier {
  level: number;
  name: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  minPoints: number;
  maxPoints: number;
}

// Fixed progression ladder. Config-driven overrides are possible later, but the
// thresholds themselves are structural (not tenant secrets), so they live here.
export const LEVEL_TIERS: LevelTier[] = [
  { level: 1, name: 'Newcomer', tier: 'bronze', minPoints: 0, maxPoints: 99 },
  { level: 2, name: 'Contributor', tier: 'bronze', minPoints: 100, maxPoints: 299 },
  { level: 3, name: 'Achiever', tier: 'silver', minPoints: 300, maxPoints: 599 },
  { level: 4, name: 'Expert', tier: 'silver', minPoints: 600, maxPoints: 999 },
  { level: 5, name: 'Champion', tier: 'gold', minPoints: 1000, maxPoints: 1999 },
  { level: 6, name: 'Legend', tier: 'platinum', minPoints: 2000, maxPoints: 4999 },
  { level: 7, name: 'Icon', tier: 'diamond', minPoints: 5000, maxPoints: Number.MAX_SAFE_INTEGER },
];

export function tierForPoints(points: number): LevelTier {
  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_TIERS[i].minPoints) return LEVEL_TIERS[i];
  }
  return LEVEL_TIERS[0];
}

export function pointsToNextLevel(points: number): number {
  const current = tierForPoints(points);
  if (current.level >= LEVEL_TIERS.length) return 0;
  const next = LEVEL_TIERS[current.level];
  return Math.max(0, next.minPoints - points);
}

/**
 * Ensure a points account row exists for (tenant, employee) and return it.
 */
export async function ensurePointsAccount(tenantId: string, employeeId: string) {
  const db = prisma as any;
  const existing = await db.gamificationPointsAccount.findFirst({
    where: { tenantId, employeeId },
  });
  if (existing) return existing;
  return db.gamificationPointsAccount.create({
    data: { tenantId, employeeId },
  });
}

/**
 * Apply a signed points delta (positive = earn, negative = redeem) and record a
 * transaction. Returns the updated account and created transaction.
 */
export async function applyPointsDelta(params: {
  tenantId: string;
  employeeId: string;
  amount: number;
  type: string;
  category: string;
  source: string;
  reason?: string;
}) {
  const db = prisma as any;
  const account = await ensurePointsAccount(params.tenantId, params.employeeId);
  const newBalance = account.currentBalance + params.amount;
  const newTotal = account.totalPoints + Math.max(0, params.amount);
  const newLifetime = account.lifetimePoints + Math.max(0, params.amount);
  const level = tierForPoints(newTotal).level;

  const updated = await db.gamificationPointsAccount.update({
    where: { id: account.id },
    data: {
      currentBalance: newBalance,
      totalPoints: newTotal,
      lifetimePoints: newLifetime,
      currentLevel: level,
    },
  });

  const txn = await db.gamificationPointsTransaction.create({
    data: {
      tenantId: params.tenantId,
      employeeId: params.employeeId,
      amount: params.amount,
      type: params.type,
      category: params.category,
      source: params.source,
      reason: params.reason ?? null,
      balanceAfter: newBalance,
    },
  });

  return { account: updated, transaction: txn };
}
