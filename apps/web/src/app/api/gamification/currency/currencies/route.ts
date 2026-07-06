import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import { forbidden, serverError, successList } from '@/lib/api/crud-helpers';
import { ensurePointsAccount } from '@/lib/gamification/points';

// Aura Coins are backed 1:1 by points; 100 AC = 1.00 USD payroll credit.
const AC_PER_USD = 100;

/**
 * Virtual currency (Aura Coin) info for the current user: the code/rate plus the
 * user's live balance (derived from their points account) and display name.
 */
export const GET = withEnhancedAuth(async (_request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const account = await ensurePointsAccount(user.tenantId, user.userId);
    const emp = await prisma.employee.findFirst({
      where: { id: user.userId, company: { tenantId: user.tenantId } },
      select: { firstName: true, lastName: true },
    });
    const displayName = emp
      ? `${emp.firstName || ''} ${emp.lastName || ''}`.trim()
      : user.email || user.userId;
    const data = [
      {
        currencyId: 'aura-coin',
        currencyCode: 'AC',
        currencyName: 'Aura Coin',
        symbol: 'AC',
        conversionRate: AC_PER_USD,
        balance: account.currentBalance,
        displayName,
        usdValue: Number((account.currentBalance / AC_PER_USD).toFixed(2)),
      },
    ];
    return successList(data, 1, 1, 1, { acPerUsd: AC_PER_USD });
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/currency/currencies' }, 'Failed to list');
    return serverError(error, 'list');
  }
});
