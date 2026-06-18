/**
 * EPIC-25 retaliation protection API.
 *
 * GET ?employeeId=...&country=... → returns the current protection
 * window for the employee (active flag + expiry + whistleblower flag).
 *
 * POST { employeeId, actionType, country?, relatedActionId?,
 *        justification? } → assesses the proposed adverse action,
 *        ALWAYS writes the assessment to the audit log, returns the
 *        typed verdict.
 */

import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { retaliationProtectionService } from '@/lib/services/er-compliance/retaliation-protection.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const VALID_ACTIONS = new Set([
  'DISCIPLINARY_ACTION',
  'TERMINATION',
  'DEMOTION',
  'SALARY_REDUCTION',
  'INVOLUNTARY_TRANSFER',
  'NEGATIVE_PERFORMANCE_REVIEW',
]);

export const GET = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'employee:read', 'risk_register:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const url = new URL(req.url);
    const employeeId = url.searchParams.get('employeeId');
    if (!employeeId) return badRequest('employeeId required');
    const country = url.searchParams.get('country') ?? undefined;
    const asOfRaw = url.searchParams.get('asOf');
    const asOf = asOfRaw ? new Date(asOfRaw) : new Date();
    const window = await retaliationProtectionService.resolveProtectionWindow(
      ctx.user.tenantId,
      employeeId,
      country,
      asOf
    );
    return ok({ window });
  } catch (err) {
    return serverError('Failed to resolve retaliation protection window', err);
  }
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'risk_register:manage', 'employee:manage')) {
    return forbidden();
  }
  try {
    const body = await req.json();
    if (!body.employeeId) return badRequest('employeeId required');
    if (!body.actionType || !VALID_ACTIONS.has(body.actionType)) {
      return badRequest('actionType must be one of ' + [...VALID_ACTIONS].join(', '));
    }
    const verdict = await retaliationProtectionService.assessAdverseAction(
      {
        employeeId: body.employeeId,
        actionType: body.actionType,
        country: body.country,
        relatedActionId: body.relatedActionId,
        justification: body.justification,
        proposedAt: body.proposedAt ? new Date(body.proposedAt) : undefined,
      },
      { tenantId: ctx.user.tenantId, userId: ctx.user.id, userEmail: (ctx.user as any).email }
    );
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to assess adverse action', err);
  }
});
