/**
 * EPIC-27 — Travel / expense compliance checks.
 *
 * Actions:
 *   { action: 'exceptionCadence', ... }   → SLA freshness for policy exception
 *   { action: 'duplicateReceipts', ... }  → identical-receipt detection
 *   { action: 'perDiemCap', ... }         → per-diem cap evaluator
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import {
  detectDuplicateReceipts,
  evaluatePerDiemCap,
  evaluatePolicyExceptionCadence,
} from '@/lib/services/expense-compliance/expense-compliance.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const exceptionSchema = z.object({
  action: z.literal('exceptionCadence'),
  exceptionId: z.string().min(1),
  raisedAt: z.string(),
  decidedAt: z.string().optional(),
  slaDays: z.number().int().min(1),
  asOf: z.string().optional(),
});

const dupeSchema = z.object({
  action: z.literal('duplicateReceipts'),
  receipts: z
    .array(
      z.object({
        receiptId: z.string().min(1),
        employeeId: z.string().min(1),
        vendor: z.string().min(1),
        date: z.string().min(8),
        amount: z.number().min(0),
        currency: z.string().min(1),
      })
    )
    .min(1),
});

const perDiemSchema = z.object({
  action: z.literal('perDiemCap'),
  claim: z.object({
    countryCode: z.string().min(2),
    cityTier: z.enum(['TIER_1', 'TIER_2', 'TIER_3']),
    daysClaimed: z.number().int().min(0),
    totalClaimedAmount: z.number().min(0),
    mealsProvided: z.boolean().optional(),
  }),
  policy: z.object({
    countryCode: z.string().min(2),
    currency: z.string().min(1),
    capsByTier: z.object({
      TIER_1: z.number().min(0),
      TIER_2: z.number().min(0),
      TIER_3: z.number().min(0),
    }),
  }),
});

const inputSchema = z.discriminatedUnion('action', [exceptionSchema, dupeSchema, perDiemSchema]);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !hasAny(
      ctx.permissions,
      'expenses:read',
      'expenses:manage',
      'travel:read',
      'travel:manage',
      'dashboard:read'
    )
  ) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return badRequest('Invalid input', { issues: parsed.error.flatten() });
    const body = parsed.data;
    if (body.action === 'exceptionCadence') {
      const verdict = evaluatePolicyExceptionCadence(
        {
          exceptionId: body.exceptionId,
          raisedAt: new Date(body.raisedAt),
          decidedAt: body.decidedAt ? new Date(body.decidedAt) : undefined,
          slaDays: body.slaDays,
        },
        body.asOf ? new Date(body.asOf) : undefined
      );
      return ok({ verdict });
    }
    if (body.action === 'duplicateReceipts') {
      const verdict = detectDuplicateReceipts(body.receipts);
      return ok({ verdict });
    }
    const verdict = evaluatePerDiemCap(body.claim, body.policy);
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to evaluate expense compliance check', err);
  }
});
