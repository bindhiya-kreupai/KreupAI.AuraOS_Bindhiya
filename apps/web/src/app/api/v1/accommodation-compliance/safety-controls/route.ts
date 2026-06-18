/**
 * EPIC-23 accommodation safety controls API.
 *
 * POST { action: 'hygiene', input: HygieneInput } → { verdict }
 * POST { action: 'fire', input: FireSafetyInput }  → { verdict }
 * POST { action: 'food', input: FoodSafetyInput }  → { verdict }
 *
 * Each input is validated by a Zod schema that mirrors the
 * corresponding service-layer Input interface, so callers get
 * field-level error messages instead of a generic 500 when
 * a mandatory measurement is missing or out of range.
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import {
  evaluateFireSafety,
  evaluateFoodSafety,
  evaluateHygiene,
  type FireSafetyInput,
  type FoodSafetyInput,
  type HygieneInput,
} from '@/lib/services/accommodation-compliance/safety-controls.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const hygieneSchema = z.object({
  occupants: z.number().int().nonnegative(),
  toiletFixtures: z.number().int().nonnegative(),
  showerFixtures: z.number().int().nonnegative(),
  cleanlinessScore: z.number().min(1).max(5),
  pestEvidence: z.boolean(),
  beddingPoor: z.boolean(),
}) satisfies z.ZodType<HygieneInput>;

const fireSafetySchema = z.object({
  smokeDetectorsWorking: z.boolean(),
  fireExtinguisherWithinDate: z.boolean(),
  emergencyExitsClear: z.boolean(),
  fireDrillLast6Months: z.boolean(),
  fireAlarmTestedMonthly: z.boolean(),
  exitBlocked: z.boolean(),
}) satisfies z.ZodType<FireSafetyInput>;

const foodSafetySchema = z.object({
  coldStorageTempOk: z.boolean(),
  hotHoldingTempOk: z.boolean(),
  handlersHealthCardsValid: z.boolean(),
  pestControlQuarterly: z.boolean(),
  pestEvidenceInPrep: z.boolean(),
  sanitationScore: z.number().min(1).max(5),
}) satisfies z.ZodType<FoodSafetyInput>;

const inputSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('hygiene'), input: hygieneSchema }),
  z.object({ action: z.literal('fire'), input: fireSafetySchema }),
  z.object({ action: z.literal('food'), input: foodSafetySchema }),
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
      const verdict = evaluateHygiene(body.input);
      return ok({ verdict });
    }
    if (body.action === 'fire') {
      const verdict = evaluateFireSafety(body.input);
      return ok({ verdict });
    }
    // food
    const verdict = evaluateFoodSafety(body.input);
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to evaluate accommodation safety controls', err);
  }
});
