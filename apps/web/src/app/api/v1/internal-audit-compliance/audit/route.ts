/**
 * EPIC-37 — Internal Audit evaluators.
 *
 * POST { action: 'controls', input }   → { verdict: ControlTestReport }
 * POST { action: 'findings', input }   → { verdict: FindingSlaReport }
 * POST { action: 'repeats', input }    → { verdict: RepeatFindingReport }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import {
  detectRepeatFindings,
  evaluateControlTestCadence,
  evaluateFindingClosureSla,
} from '@/lib/services/internal-audit-compliance/internal-audit.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';
const isoDate = z.string().datetime();

const controlsInputSchema = z.object({
  controls: z.array(
    z.object({
      controlId: z.string().min(1),
      name: z.string().min(1),
      testCadenceDays: z.number().int().positive(),
      lastTestedAt: isoDate.optional(),
      inScope: z.boolean(),
    })
  ),
  asOf: isoDate.optional(),
});

const severityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

const findingsInputSchema = z.object({
  findings: z.array(
    z.object({
      findingId: z.string().min(1),
      controlId: z.string().optional(),
      raisedAt: isoDate,
      severity: severityEnum,
      closedAt: isoDate.optional(),
      overrideSlaDays: z.number().int().positive().optional(),
    })
  ),
  asOf: isoDate.optional(),
});

const repeatsInputSchema = z.object({
  history: z.array(
    z.object({
      findingId: z.string().min(1),
      controlId: z.string().min(1),
      category: z.string().min(1),
      raisedAt: isoDate,
    })
  ),
  minOccurrences: z.number().int().min(2).optional(),
});

const inputSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('controls'), input: controlsInputSchema }),
  z.object({ action: z.literal('findings'), input: findingsInputSchema }),
  z.object({ action: z.literal('repeats'), input: repeatsInputSchema }),
]);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'audit:read', 'compliance:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return badRequest('Invalid input', { issues: parsed.error.flatten() });
    const body = parsed.data;

    if (body.action === 'controls') {
      const verdict = evaluateControlTestCadence(
        body.input.controls.map((c) => ({
          ...c,
          lastTestedAt: c.lastTestedAt ? new Date(c.lastTestedAt) : undefined,
        })),
        body.input.asOf ? new Date(body.input.asOf) : new Date()
      );
      return ok({ verdict });
    }
    if (body.action === 'findings') {
      const verdict = evaluateFindingClosureSla(
        body.input.findings.map((f) => ({
          ...f,
          raisedAt: new Date(f.raisedAt),
          closedAt: f.closedAt ? new Date(f.closedAt) : undefined,
        })),
        body.input.asOf ? new Date(body.input.asOf) : new Date()
      );
      return ok({ verdict });
    }
    const verdict = detectRepeatFindings(
      body.input.history.map((h) => ({ ...h, raisedAt: new Date(h.raisedAt) })),
      body.input.minOccurrences ?? 2
    );
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to evaluate internal audit', err);
  }
});
