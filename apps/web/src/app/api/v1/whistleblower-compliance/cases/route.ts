/**
 * EPIC-31 — Whistleblower evaluators.
 *
 * POST { action: 'retaliation', input: ... } → { verdict: RetaliationReport }
 * POST { action: 'sla', input: ... }         → { verdict: CaseSlaReport }
 *
 * Note: Anonymous intake is exposed in a separate route to keep
 * the dashboard form simple and stays out of this evaluator stack.
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import {
  detectRetaliation,
  evaluateCaseSla,
} from '@/lib/services/whistleblower-compliance/whistleblower.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const isoDate = z.string().datetime();

const retaliationInputSchema = z.object({
  reporters: z.array(z.object({ sealedId: z.string().min(1), filedAt: isoDate })),
  events: z.array(
    z.object({
      sealedId: z.string().min(1),
      eventType: z.enum([
        'DISCIPLINARY',
        'TRANSFER',
        'TERMINATION',
        'DEMOTION',
        'PIP',
        'OT_CUT',
        'SHIFT_CHANGE',
      ]),
      occurredAt: isoDate,
      reason: z.string().optional(),
    })
  ),
  windowDays: z.number().int().positive().max(365).optional(),
});

const slaInputSchema = z.object({
  cases: z.array(
    z.object({
      caseId: z.string().min(1),
      intakeAt: isoDate,
      triagedAt: isoDate.optional(),
      investigationStartedAt: isoDate.optional(),
      closedAt: isoDate.optional(),
    })
  ),
  config: z.object({
    triageDays: z.number().int().positive(),
    investigationDays: z.number().int().positive(),
    closureDays: z.number().int().positive(),
  }),
  asOf: isoDate.optional(),
});

const inputSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('retaliation'), input: retaliationInputSchema }),
  z.object({ action: z.literal('sla'), input: slaInputSchema }),
]);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (
    !hasAny(ctx.permissions, 'whistleblower:read', 'er:read', 'compliance:read', 'dashboard:read')
  ) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return badRequest('Invalid input', { issues: parsed.error.flatten() });
    const body = parsed.data;

    if (body.action === 'retaliation') {
      const verdict = detectRetaliation(
        body.input.reporters.map((r) => ({ sealedId: r.sealedId, filedAt: new Date(r.filedAt) })),
        body.input.events.map((e) => ({
          sealedId: e.sealedId,
          eventType: e.eventType,
          occurredAt: new Date(e.occurredAt),
          reason: e.reason,
        })),
        body.input.windowDays ?? 90
      );
      return ok({ verdict });
    }
    const verdict = evaluateCaseSla(
      body.input.cases.map((c) => ({
        caseId: c.caseId,
        intakeAt: new Date(c.intakeAt),
        triagedAt: c.triagedAt ? new Date(c.triagedAt) : undefined,
        investigationStartedAt: c.investigationStartedAt
          ? new Date(c.investigationStartedAt)
          : undefined,
        closedAt: c.closedAt ? new Date(c.closedAt) : undefined,
      })),
      body.input.config,
      body.input.asOf ? new Date(body.input.asOf) : new Date()
    );
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to evaluate whistleblower cases', err);
  }
});
