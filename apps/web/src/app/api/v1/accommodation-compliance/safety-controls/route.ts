/**
 * EPIC-23 accommodation safety controls API.
 *
 * POST { action: 'hygiene', input: HygieneInput } → { verdict }
 * POST { action: 'fire', input: FireSafetyInput }  → { verdict }
 * POST { action: 'food', input: FoodSafetyInput }  → { verdict }
 */

import type { NextRequest } from 'next/server';
import { withEnhancedAuth } from '@/lib/auth';
import {
  evaluateFireSafety,
  evaluateFoodSafety,
  evaluateHygiene,
} from '@/lib/services/accommodation-compliance/safety-controls.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'accommodation:read', 'hse:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const body = await req.json();
    if (!body.input) return badRequest('input required');

    if (body.action === 'hygiene') {
      const verdict = evaluateHygiene(body.input);
      return ok({ verdict });
    }
    if (body.action === 'fire') {
      const verdict = evaluateFireSafety(body.input);
      return ok({ verdict });
    }
    if (body.action === 'food') {
      const verdict = evaluateFoodSafety(body.input);
      return ok({ verdict });
    }
    return badRequest('action must be one of hygiene | fire | food');
  } catch (err) {
    return serverError('Failed to evaluate accommodation safety controls', err);
  }
});
