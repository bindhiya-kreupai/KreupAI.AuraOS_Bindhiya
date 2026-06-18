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
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { evaluateTransition } from '@/lib/services/recruitment-compliance/stage-gate.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const stageEnum = z.enum([
  'APPLIED',
  'SCREENED',
  'INTERVIEWED',
  'BGV',
  'OFFER',
  'JOINING',
  'REJECTED',
  'WITHDRAWN',
]);

const inputSchema = z.object({
  snapshot: z.object({
    caseId: z.string().min(1),
    candidateId: z.string().min(1),
    currentStage: stageEnum,
    countryCode: z.string().optional(),
    screeningScore: z.number().optional(),
    screeningPassMark: z.number().optional(),
    interviewRoundsCompleted: z.number().optional(),
    interviewRequiredRounds: z.number().optional(),
    bgvStatus: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'PASSED', 'FAILED', 'WAIVED']).optional(),
    immigrationEligible: z.boolean().optional(),
    biasReviewPassed: z.boolean().optional(),
  }),
  toStage: stageEnum,
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'recruitment:read', 'recruitment:manage', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest('Invalid input', { issues: parsed.error.flatten() });
    }
    const body = parsed.data;
    const verdict = evaluateTransition(body.snapshot, body.toStage);
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to evaluate stage transition', err);
  }
});
