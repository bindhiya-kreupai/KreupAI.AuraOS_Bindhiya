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

const flexDate = z
  .string()
  .refine((val) => !isNaN(new Date(val).getTime()), { message: 'Invalid date' });

const controlsInputSchema = z.object({
  controls: z.array(
    z.object({
      controlId: z.string().optional().nullable(),
      name: z.string().optional().nullable(),
      testCadenceDays: z.number().optional().nullable(),
      lastTestedAt: flexDate.optional().nullable(),
      inScope: z.boolean().optional().nullable(),
    })
  ),
  asOf: flexDate.optional().nullable(),
});

const severityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

const findingsInputSchema = z.object({
  findings: z.array(
    z.object({
      findingId: z.string().optional().nullable(),
      controlId: z.string().optional().nullable(),
      raisedAt: flexDate,
      severity: severityEnum.optional().nullable(),
      closedAt: flexDate.optional().nullable(),
      overrideSlaDays: z.number().optional().nullable(),
    })
  ),
  asOf: flexDate.optional().nullable(),
});

const repeatsInputSchema = z.object({
  history: z.array(
    z.object({
      findingId: z.string().optional().nullable(),
      controlId: z.string().optional().nullable(),
      category: z.string().optional().nullable(),
      raisedAt: flexDate,
    })
  ),
  minOccurrences: z.number().optional().nullable(),
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
        body.input.controls.map((c, idx) => ({
          controlId: String(c.controlId || `CTRL-${idx + 1}`),
          name: String(c.name || 'Control'),
          testCadenceDays: Number(c.testCadenceDays ?? 0),
          inScope: c.inScope ?? false,
          lastTestedAt: c.lastTestedAt ? new Date(c.lastTestedAt) : undefined,
        })),
        body.input.asOf ? new Date(body.input.asOf) : new Date()
      );
      return ok({ verdict });
    }
    if (body.action === 'findings') {
      const verdict = evaluateFindingClosureSla(
        body.input.findings.map((f, idx) => ({
          findingId: String(f.findingId || `FND-${idx + 1}`),
          controlId: f.controlId ? String(f.controlId) : undefined,
          raisedAt: new Date(f.raisedAt),
          severity: (f.severity as any) ?? 'MEDIUM',
          closedAt: f.closedAt ? new Date(f.closedAt) : undefined,
          overrideSlaDays: f.overrideSlaDays ? Number(f.overrideSlaDays) : undefined,
        })),
        body.input.asOf ? new Date(body.input.asOf) : new Date()
      );
      return ok({ verdict });
    }
    const verdict = detectRepeatFindings(
      body.input.history.map((h, idx) => ({
        findingId: String(h.findingId || `FND-${idx + 1}`),
        controlId: String(h.controlId || `CTRL-${idx + 1}`),
        category: String(h.category || 'GENERAL'),
        raisedAt: new Date(h.raisedAt),
      })),
      body.input.minOccurrences ? Number(body.input.minOccurrences) : 2
    );
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to evaluate internal audit', err);
  }
});
