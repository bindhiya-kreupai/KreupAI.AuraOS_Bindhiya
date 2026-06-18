/**
 * EPIC-04 recruitment stage-gate API.
 *
 * POST { snapshot: CaseSnapshot, toStage } → { verdict: TransitionVerdict }
 *
 * Stateless evaluator — caller supplies the case snapshot
 * (currentStage, screeningScore, BGV status, immigrationEligible,
 * etc.) and the desired next stage; route returns the typed verdict.
 */

import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import { evaluateTransition } from '@/lib/services/recruitment-compliance/stage-gate.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'recruitment:read', 'recruitment:manage', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const body = await req.json();
    if (!body.snapshot?.caseId) return badRequest('snapshot.caseId required');
    if (!body.snapshot?.currentStage) return badRequest('snapshot.currentStage required');
    if (!body.toStage) return badRequest('toStage required');
    const verdict = evaluateTransition(body.snapshot, body.toStage);
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to evaluate stage transition', err);
  }
});
