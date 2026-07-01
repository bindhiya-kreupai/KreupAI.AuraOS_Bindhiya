import type { NextRequest } from 'next/server';
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

/**
 * Redeem (spend) points for the current user. Validates the available balance
 * before recording a negative transaction.
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const body = await safeJson(request);
    const points = Number(body?.points);
    if (!body || !Number.isFinite(points) || points <= 0) {
      return validationError({
        message: 'points must be a positive number',
        messageAr: 'يجب أن تكون النقاط رقمًا موجبًا',
      });
    }
    const employeeId = user.userId;
    const account = await ensurePointsAccount(user.tenantId, employeeId);
    if (account.currentBalance < points) {
      return validationError({
        message: 'Insufficient points balance',
        messageAr: 'رصيد النقاط غير كافٍ',
      });
    }
    const { transaction } = await applyPointsDelta({
      tenantId: user.tenantId,
      employeeId,
      amount: -Math.round(points),
      type: 'redeem',
      category: 'redemption',
      source: 'redemption',
      reason: body.reason ? String(body.reason) : 'Reward redemption',
    });
    return successItem(transaction, { status: 201 });
  } catch (error: any) {
    logger.error(
      { err: error, route: 'gamification/points/transactions/redeem' },
      'Failed to redeem'
    );
    return serverError(error, 'redeem');
  }
});
