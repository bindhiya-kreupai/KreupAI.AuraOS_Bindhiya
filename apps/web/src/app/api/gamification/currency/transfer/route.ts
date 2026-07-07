import type { NextRequest } from 'next/server';
import { prisma } from '@aura/database';
import { withEnhancedAuth } from '@/lib/auth';
import { logger } from '@/lib/logger';
import {
  forbidden,
  notFound,
  safeJson,
  serverError,
  successItem,
  validationError,
} from '@/lib/api/crud-helpers';
import { ensurePointsAccount, applyPointsDelta } from '@/lib/gamification/points';

/**
 * Transfer Aura Coins (points) from the current user to a colleague in the same
 * tenant. Debits the sender and credits the recipient atomically-ish, and logs
 * a currency transaction row for the audit trail.
 */
export const POST = withEnhancedAuth(async (request: NextRequest, context: any) => {
  try {
    const { user, permissions } = context;
    if (!permissions.includes('engagement:read')) return forbidden('engagement:read');
    const body = await safeJson(request);
    const amount = Number(body?.amount);
    if (!body || !body.toUserId || !Number.isFinite(amount) || amount <= 0) {
      return validationError({
        message: 'toUserId and a positive amount are required',
        messageAr: 'المستلم ومبلغ موجب مطلوبان',
      });
    }
    const toUserId = String(body.toUserId);
    if (toUserId === user.userId) {
      return validationError({
        message: 'Cannot transfer to yourself',
        messageAr: 'لا يمكن التحويل إلى نفسك',
      });
    }

    const recipient = await prisma.employee.findFirst({
      where: { id: toUserId, company: { tenantId: user.tenantId } },
      select: { id: true },
    });
    if (!recipient) return notFound('Recipient');

    const sender = await ensurePointsAccount(user.tenantId, user.userId);
    if (sender.currentBalance < amount) {
      return validationError({
        message: 'Insufficient balance to transfer',
        messageAr: 'رصيد غير كافٍ للتحويل',
      });
    }

    const rounded = Math.round(amount);
    await applyPointsDelta({
      tenantId: user.tenantId,
      employeeId: user.userId,
      amount: -rounded,
      type: 'redeem',
      category: 'transfer',
      source: 'transfer_out',
      reason: `Transfer to ${toUserId}`,
    });
    await applyPointsDelta({
      tenantId: user.tenantId,
      employeeId: toUserId,
      amount: rounded,
      type: 'bonus',
      category: 'transfer',
      source: 'transfer_in',
      reason: `Transfer from ${user.userId}`,
    });

    const txn = await (prisma as any).gamificationCurrencyTransaction.create({
      data: {
        tenantId: user.tenantId,
        employeeId: user.userId,
        type: 'transfer',
        amount: -rounded,
        counterparty: toUserId,
        description: body.note ? String(body.note) : `Transfer of ${rounded} AC`,
      },
    });
    return successItem(txn, { status: 201 });
  } catch (error: any) {
    logger.error({ err: error, route: 'gamification/currency/transfer' }, 'Failed to transfer');
    return serverError(error, 'transfer');
  }
});
