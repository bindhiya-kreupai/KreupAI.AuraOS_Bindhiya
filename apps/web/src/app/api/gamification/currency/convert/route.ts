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
import { ensurePointsAccount } from '@/lib/gamification/points';

const AC_PER_USD = 100;

/**
 * Convert Aura Coins to a USD value (informational — records the conversion
 * intent without moving points; cash-out performs the actual debit). Validates
 * the balance and returns the USD equivalent.
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const body = await safeJson(request);
    const points = Number(body?.points ?? body?.amount);
    if (!body || !Number.isFinite(points) || points <= 0) {
      return validationError({
        message: 'A positive amount is required',
        messageAr: 'مبلغ موجب مطلوب',
      });
    }
    const account = await ensurePointsAccount(user.tenantId, user.userId);
    const rounded = Math.round(points);
    if (account.currentBalance < rounded) {
      return validationError({
        message: 'Insufficient balance to convert',
        messageAr: 'رصيد غير كافٍ للتحويل',
      });
    }
    const usd = Number((rounded / AC_PER_USD).toFixed(2));
    const txn = await (prisma as any).gamificationCurrencyTransaction.create({
      data: {
        tenantId: user.tenantId,
        employeeId: user.userId,
        type: 'convert',
        amount: rounded,
        description: `Converted ${rounded} AC to $${usd}`,
      },
    });
    return successItem({ ...txn, usdValue: usd, rate: AC_PER_USD });
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/currency/convert' }, 'Failed to convert');
    return serverError(error, 'convert');
  }
});
