/**
 * EPIC-32 — Records Retention evaluators.
 *
 * POST { action: 'retention', input: ... }     → { verdict: RetentionReport }
 * POST { action: 'legalHold', input: ... }     → { verdict: LegalHoldReport }
 * POST { action: 'destruction', input: ... }   → { verdict: DestructionLogReport }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import {
  detectLegalHoldConflicts,
  evaluateRetentionSchedule,
  validateDestructionLog,
} from '@/lib/services/records-retention-compliance/records-retention.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';
const isoDate = z.string().datetime();

const retentionInputSchema = z.object({
  records: z.array(
    z.object({
      recordId: z.string().min(1),
      category: z.string().min(1),
      createdAt: isoDate,
      retentionDays: z.number().int().positive(),
      destroyedAt: isoDate.optional(),
    })
  ),
  asOf: isoDate.optional(),
});

const legalHoldInputSchema = z.object({
  holds: z.array(
    z.object({
      holdId: z.string().min(1),
      recordId: z.string().min(1),
      startedAt: isoDate,
      releasedAt: isoDate.optional(),
      reason: z.string().min(1),
    })
  ),
  requests: z.array(
    z.object({
      recordId: z.string().min(1),
      requestedAt: isoDate,
      requestedBy: z.string().optional(),
    })
  ),
});

const destructionInputSchema = z.object({
  entries: z.array(
    z.object({
      recordId: z.string().min(1),
      destroyedAt: isoDate,
      destroyedBy: z.string().optional(),
      method: z.enum(['SHRED', 'WIPE', 'DEGAUSS', 'INCINERATE']).optional(),
      witnessId: z.string().optional(),
      certificateRef: z.string().optional(),
    })
  ),
  asOf: isoDate.optional(),
});

const inputSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('retention'), input: retentionInputSchema }),
  z.object({ action: z.literal('legalHold'), input: legalHoldInputSchema }),
  z.object({ action: z.literal('destruction'), input: destructionInputSchema }),
]);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'records:read', 'compliance:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return badRequest('Invalid input', { issues: parsed.error.flatten() });
    const body = parsed.data;

    if (body.action === 'retention') {
      const verdict = evaluateRetentionSchedule(
        body.input.records.map((r) => ({
          ...r,
          createdAt: new Date(r.createdAt),
          destroyedAt: r.destroyedAt ? new Date(r.destroyedAt) : undefined,
        })),
        body.input.asOf ? new Date(body.input.asOf) : new Date()
      );
      return ok({ verdict });
    }
    if (body.action === 'legalHold') {
      const verdict = detectLegalHoldConflicts(
        body.input.holds.map((h) => ({
          ...h,
          startedAt: new Date(h.startedAt),
          releasedAt: h.releasedAt ? new Date(h.releasedAt) : undefined,
        })),
        body.input.requests.map((r) => ({ ...r, requestedAt: new Date(r.requestedAt) }))
      );
      return ok({ verdict });
    }
    const verdict = validateDestructionLog(
      body.input.entries.map((e) => ({ ...e, destroyedAt: new Date(e.destroyedAt) })),
      body.input.asOf ? new Date(body.input.asOf) : new Date()
    );
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to evaluate records retention', err);
  }
});
