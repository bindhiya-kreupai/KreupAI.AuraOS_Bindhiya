/**
 * EPIC-10 payroll period-lock + cut-off gate API.
 *
 * POST { period, changeType, actorRole?, hasJustification? } →
 *   { verdict: PeriodGateVerdict }
 *
 * Stateless evaluator. Caller passes the period config (period
 * identifier, cutOffDate, processedAt?, releasedAt?) and the proposed
 * change context; route returns the typed verdict (allow, reason,
 * periodStatus, requiresJustification, requiresSeniorApproval).
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { evaluateChangeAgainstPeriod } from '@/lib/services/payroll/period-lock.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const changeTypeEnum = z.enum([
  'ATTENDANCE_REGULARIZATION',
  'LEAVE_APPLICATION',
  'LEAVE_CANCELLATION',
  'SALARY_CHANGE',
  'NEW_HIRE',
  'TERMINATION',
  'EXPENSE_CLAIM',
]);

const flexDate = z
  .string()
  .refine((val) => !isNaN(new Date(val).getTime()), { message: 'Invalid date' });

const inputSchema = z.object({
  changeType: changeTypeEnum,
  period: z.object({
    period: z.string().min(1),
    cutOffDate: flexDate,
    processedAt: flexDate.optional(),
    releasedAt: flexDate.optional(),
  }),
  appliedAt: flexDate.optional(),
  actorRole: z.string().optional(),
  hasJustification: z.boolean().optional(),
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'payroll:read', 'payroll:manage', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest('Invalid input', { issues: parsed.error.flatten() });
    }
    const body = parsed.data;
    const verdict = evaluateChangeAgainstPeriod({
      changeType: body.changeType,
      period: {
        period: body.period.period,
        cutOffDate: new Date(body.period.cutOffDate),
        processedAt: body.period.processedAt ? new Date(body.period.processedAt) : undefined,
        releasedAt: body.period.releasedAt ? new Date(body.period.releasedAt) : undefined,
      },
      appliedAt: body.appliedAt ? new Date(body.appliedAt) : new Date(),
      actorRole: body.actorRole,
      hasJustification: body.hasJustification,
    });
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to evaluate period gate', err);
  }
});
