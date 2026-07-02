import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  forbidden,
  safeJson,
  serverError,
  successItem,
  validationError,
} from '@/lib/api/crud-helpers';
import { ensurePointsAccount, applyPointsDelta } from '@/lib/gamification/points';

const AC_PER_USD = 100;

/**
 * Cash out Aura Coins to payroll credit. Debits the balance and records a
 * currency transaction with the USD equivalent for payroll reconciliation.
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const body = await safeJson(request);
    const amount = Number(body?.amount);
    if (!body || !Number.isFinite(amount) || amount <= 0) {
      return validationError({
        message: 'A positive amount is required',
        messageAr: 'مبلغ موجب مطلوب',
      });
    }
    const account = await ensurePointsAccount(user.tenantId, user.userId);
    const rounded = Math.round(amount);
    if (account.currentBalance < rounded) {
      return validationError({
        message: 'Insufficient balance to cash out',
        messageAr: 'رصيد غير كافٍ للصرف',
      });
    }

    await applyPointsDelta({
      tenantId: user.tenantId,
      employeeId: user.userId,
      amount: -rounded,
      type: 'redeem',
      category: 'cashout',
      source: 'payroll_credit',
      reason: `Cash out ${rounded} AC to payroll`,
    });

    const usd = Number((rounded / AC_PER_USD).toFixed(2));
    const txn = await (prisma as any).gamificationCurrencyTransaction.create({
      data: {
        tenantId: user.tenantId,
        employeeId: user.userId,
        type: 'cashout',
        amount: -rounded,
        description: `Cash out ${rounded} AC = $${usd} payroll credit`,
      },
    });
    return successItem({ ...txn, usdValue: usd }, { status: 201 });
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/currency/cashout' }, 'Failed to cash out');
    return serverError(error, 'cashout');
  }
});
