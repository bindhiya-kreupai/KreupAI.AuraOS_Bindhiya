/**
 * EPIC-13 GOSI obligation calendar.
 *
 * POST { months: [{ wageMonth, wageFiled?, contributionSettled? }], asOf? }
 *   → { verdict: GosiObligationReport }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { evaluateGosiObligations } from '@/lib/services/gosi-compliance/obligation-calendar.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const isoDate = z.string().datetime();

const inputSchema = z.object({
  months: z
    .array(
      z.object({
        wageMonth: isoDate,
        wageFiled: z.boolean().optional(),
        contributionSettled: z.boolean().optional(),
      })
    )
    .min(1)
    .max(36),
  asOf: isoDate.optional(),
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'gosi:read', 'compliance:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return badRequest('Invalid input', { issues: parsed.error.flatten() });
    const asOf = parsed.data.asOf ? new Date(parsed.data.asOf) : new Date();
    const verdict = evaluateGosiObligations(
      parsed.data.months.map((m) => ({
        wageMonth: new Date(m.wageMonth),
        wageFiled: m.wageFiled,
        contributionSettled: m.contributionSettled,
        asOf,
      }))
    );
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to evaluate GOSI obligations', err);
  }
});
