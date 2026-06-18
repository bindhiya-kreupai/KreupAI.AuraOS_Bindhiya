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
import { withEnhancedAuth } from '@/lib/auth';
import { evaluateChangeAgainstPeriod } from '@/lib/services/payroll/period-lock.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const VALID_CHANGE_TYPES = new Set([
  'ATTENDANCE_REGULARIZATION',
  'LEAVE_APPLICATION',
  'LEAVE_CANCELLATION',
  'SALARY_CHANGE',
  'NEW_HIRE',
  'TERMINATION',
  'EXPENSE_CLAIM',
]);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'payroll:read', 'payroll:manage', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const body = await req.json();
    if (!body.period?.period) return badRequest('period.period (YYYY-MM) required');
    if (!body.period?.cutOffDate) return badRequest('period.cutOffDate required');
    if (!body.changeType || !VALID_CHANGE_TYPES.has(body.changeType)) {
      return badRequest('changeType must be one of ' + [...VALID_CHANGE_TYPES].join(', '));
    }
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
