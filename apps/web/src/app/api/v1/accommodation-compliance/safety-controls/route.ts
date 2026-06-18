/**
 * EPIC-23 accommodation safety controls API.
 *
 * POST { action: 'hygiene', input: HygieneInput } → { verdict }
 * POST { action: 'fire', input: FireSafetyInput }  → { verdict }
 * POST { action: 'food', input: FoodSafetyInput }  → { verdict }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import {
  evaluateFireSafety,
  evaluateFoodSafety,
  evaluateHygiene,
} from '@/lib/services/accommodation-compliance/safety-controls.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const inputSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('hygiene'), input: z.record(z.unknown()) }),
  z.object({ action: z.literal('fire'), input: z.record(z.unknown()) }),
  z.object({ action: z.literal('food'), input: z.record(z.unknown()) }),
]);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'accommodation:read', 'hse:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) {
      return badRequest('Invalid input', { issues: parsed.error.flatten() });
    }
    const body = parsed.data;

    if (body.action === 'hygiene') {
      const verdict = evaluateHygiene(body.input as any);
      return ok({ verdict });
    }
    if (body.action === 'fire') {
      const verdict = evaluateFireSafety(body.input as any);
      return ok({ verdict });
    }
    // food
    const verdict = evaluateFoodSafety(body.input as any);
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to evaluate accommodation safety controls', err);
  }
});
