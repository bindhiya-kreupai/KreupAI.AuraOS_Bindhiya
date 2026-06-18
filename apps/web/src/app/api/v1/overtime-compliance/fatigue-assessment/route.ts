/**
 * EPIC-12 fatigue assessment API.
 *
 * POST { employeeId, proposedStart, proposedEnd, country?, appliesTo?,
 *        actorRole? } → { verdict: FatigueAssessmentVerdict }
 *
 * Resolves the active FatigueRule for the country, walks the
 * employee's 8-day attendance history, and returns the typed verdict
 * with breach reasons + DoA escalation hint.
 */

import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { fatigueAssessmentService } from '@/lib/services/overtime-compliance/fatigue-assessment.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'attendance:manage', 'attendance:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const body = await req.json();
    if (!body.employeeId) return badRequest('employeeId required');
    if (!body.proposedStart) return badRequest('proposedStart required');
    if (!body.proposedEnd) return badRequest('proposedEnd required');
    const verdict = await fatigueAssessmentService.assess({
      tenantId: ctx.user.tenantId,
      employeeId: body.employeeId,
      proposedStart: new Date(body.proposedStart),
      proposedEnd: new Date(body.proposedEnd),
      country: body.country,
      appliesTo: body.appliesTo,
      actorRole: body.actorRole,
    });
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to assess fatigue', err);
  }
});
