/**
 * EPIC-15 Bahrain — LMRA / SIO / IGA evaluator API.
 *
 * POST { action: 'lmra' | 'sio' | 'iga', input: <action-specific> }
 *   → { verdict: <action-specific report> }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import {
  evaluateIgaWageProtection,
  evaluateLmraPermitCalendar,
  evaluateSioObligations,
} from '@/lib/services/sio-compliance/bahrain-permit-calendar.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const isoDate = z.string().datetime();

const lmraInputSchema = z.object({
  permits: z
    .array(
      z.object({
        permitId: z.string().min(1),
        employeeId: z.string().min(1),
        expiresAt: isoDate,
        renewalLodged: z.boolean().optional(),
      })
    )
    .min(1)
    .max(10_000),
  asOf: isoDate.optional(),
  renewalWindowDays: z.number().int().positive().max(365).optional(),
  dueSoonWindowDays: z.number().int().positive().max(60).optional(),
  lowBandMaxDays: z.number().int().positive().max(120).optional(),
  highBandMaxDays: z.number().int().positive().max(365).optional(),
  feePerDayBhd: z
    .object({ low: z.number().nonnegative(), high: z.number().nonnegative() })
    .optional(),
});

const sioInputSchema = z.object({
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

const igaInputSchema = z.object({
  rows: z
    .array(
      z.object({
        employeeId: z.string().min(1),
        wageMonth: isoDate,
        expectedAmountBhd: z.number().nonnegative(),
        creditedAmountBhd: z.number().nonnegative().optional(),
        creditedAt: isoDate.optional(),
      })
    )
    .min(1)
    .max(20_000),
  asOf: isoDate.optional(),
  dueDayOfMonth: z.number().int().min(1).max(28).optional(),
  warnAfterDays: z.number().int().nonnegative().optional(),
  blockAfterDays: z.number().int().nonnegative().optional(),
  shortfallTolerancePct: z.number().nonnegative().optional(),
});

const inputSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('lmra'), input: lmraInputSchema }),
  z.object({ action: z.literal('sio'), input: sioInputSchema }),
  z.object({ action: z.literal('iga'), input: igaInputSchema }),
]);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'sio:read', 'compliance:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return badRequest('Invalid input', { issues: parsed.error.flatten() });
    const body = parsed.data;
    const asOfDefault = new Date();

    if (body.action === 'lmra') {
      const verdict = evaluateLmraPermitCalendar({
        ...body.input,
        asOf: body.input.asOf ? new Date(body.input.asOf) : asOfDefault,
        permits: body.input.permits.map((p) => ({
          permitId: p.permitId,
          employeeId: p.employeeId,
          expiresAt: new Date(p.expiresAt),
          renewalLodged: p.renewalLodged,
        })),
      });
      return ok({ verdict });
    }
    if (body.action === 'sio') {
      const asOf = body.input.asOf ? new Date(body.input.asOf) : asOfDefault;
      const verdict = evaluateSioObligations(
        body.input.months.map((m) => ({
          wageMonth: new Date(m.wageMonth),
          wageFiled: m.wageFiled,
          contributionSettled: m.contributionSettled,
          asOf,
        }))
      );
      return ok({ verdict });
    }
    // iga
    const verdict = evaluateIgaWageProtection({
      ...body.input,
      asOf: body.input.asOf ? new Date(body.input.asOf) : asOfDefault,
      rows: body.input.rows.map((r) => ({
        employeeId: r.employeeId,
        wageMonth: new Date(r.wageMonth),
        expectedAmountBhd: r.expectedAmountBhd,
        creditedAmountBhd: r.creditedAmountBhd,
        creditedAt: r.creditedAt ? new Date(r.creditedAt) : undefined,
      })),
    });
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to evaluate Bahrain compliance', err);
  }
});
