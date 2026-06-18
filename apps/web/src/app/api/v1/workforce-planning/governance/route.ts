/**
 * EPIC-03-S07 — Governance control matrix.
 *
 * POST { controls, evidences, asOf? } → { verdict: GovernanceReport }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import { evaluateGovernanceMatrix } from '@/lib/services/workforce-planning/workforce-planning.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const isoDate = z.string().datetime();

const inputSchema = z.object({
  controls: z.array(
    z.object({
      code: z.string().min(1),
      label: z.string().min(1),
      labelAr: z.string().optional(),
      domain: z.string().min(1),
      requiredRoles: z.array(z.string()),
      cadenceDays: z.number().int().positive(),
      evidenceType: z.string().min(1),
    })
  ),
  evidences: z.array(
    z.object({
      controlCode: z.string().min(1),
      evidencedAt: isoDate,
      evidencedBy: z.string().min(1),
      evidenceRef: z.string().optional(),
    })
  ),
  asOf: isoDate.optional(),
});

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'workforce_planning:read', 'dashboard:read')) return forbidden();
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return badRequest('Invalid input', { issues: parsed.error.flatten() });
    const verdict = evaluateGovernanceMatrix(
      parsed.data.controls,
      parsed.data.evidences.map((e) => ({ ...e, evidencedAt: new Date(e.evidencedAt) })),
      parsed.data.asOf ? new Date(parsed.data.asOf) : new Date()
    );
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to evaluate governance matrix', err);
  }
});
