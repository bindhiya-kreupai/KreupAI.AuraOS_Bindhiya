/**
 * EPIC-36 — Policy lifecycle evaluators.
 *
 * POST { action: 'review', input }  → { verdict: PolicyReviewReport }
 * POST { action: 'diff', input }    → { verdict: PolicyDiffReport }
 * POST { action: 'ack', input }     → { verdict: AckCoverageReport }
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import {
  diffPolicyVersions,
  evaluateAckCoverage,
  evaluatePolicyReviewCadence,
} from '@/lib/services/policy-lifecycle-compliance/policy-lifecycle.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';
const isoDate = z.string().datetime();

const reviewInputSchema = z.object({
  policies: z.array(
    z.object({
      policyId: z.string().min(1),
      title: z.string().min(1),
      reviewCadenceDays: z.number().int().positive(),
      lastReviewedAt: isoDate.optional(),
      active: z.boolean(),
    })
  ),
  asOf: isoDate.optional(),
});

const diffInputSchema = z.object({
  policyId: z.string().min(1),
  previous: z.string(),
  next: z.string(),
  previousVersion: z.string().optional(),
  nextVersion: z.string().optional(),
});

const ackInputSchema = z.object({
  requirements: z.array(
    z.object({
      policyId: z.string().min(1),
      publishedAt: isoDate,
      ackWindowDays: z.number().int().positive(),
      audience: z.array(z.string().min(1)),
    })
  ),
  records: z.array(
    z.object({
      policyId: z.string().min(1),
      employeeId: z.string().min(1),
      acknowledgedAt: isoDate,
    })
  ),
  asOf: isoDate.optional(),
});

const inputSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('review'), input: reviewInputSchema }),
  z.object({ action: z.literal('diff'), input: diffInputSchema }),
  z.object({ action: z.literal('ack'), input: ackInputSchema }),
]);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'policy:read', 'compliance:read', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return badRequest('Invalid input', { issues: parsed.error.flatten() });
    const body = parsed.data;

    if (body.action === 'review') {
      const verdict = evaluatePolicyReviewCadence(
        body.input.policies.map((p) => ({
          ...p,
          lastReviewedAt: p.lastReviewedAt ? new Date(p.lastReviewedAt) : undefined,
        })),
        body.input.asOf ? new Date(body.input.asOf) : new Date()
      );
      return ok({ verdict });
    }
    if (body.action === 'diff') {
      const verdict = diffPolicyVersions(body.input);
      return ok({ verdict });
    }
    const verdict = evaluateAckCoverage(
      body.input.requirements.map((r) => ({ ...r, publishedAt: new Date(r.publishedAt) })),
      body.input.records.map((r) => ({ ...r, acknowledgedAt: new Date(r.acknowledgedAt) })),
      body.input.asOf ? new Date(body.input.asOf) : new Date()
    );
    return ok({ verdict });
  } catch (err) {
    return serverError('Failed to evaluate policy lifecycle', err);
  }
});
