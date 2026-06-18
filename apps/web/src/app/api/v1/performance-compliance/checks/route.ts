/**
 * EPIC-25 — Performance compliance checks.
 *
 * Actions:
 *   { action: 'forcedDistribution', ... }   → curve drift + manager skew
 *   { action: 'calibrationEvidence', ... }  → cycle calibration freshness
 *   { action: 'resolveRating', code }       → bilingual rating dictionary lookup
 */

import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { withEnhancedAuth } from '@/lib/auth';
import {
  checkCalibrationEvidence,
  detectForcedDistribution,
  resolveRating,
  DEFAULT_RATING_DICTIONARY,
} from '@/lib/services/performance-compliance/performance-compliance.service';
import { badRequest, forbidden, hasAny, ok, serverError, type RouteContext } from '../_shared';

export const dynamic = 'force-dynamic';

const distSchema = z.object({
  action: z.literal('forcedDistribution'),
  observed: z.array(z.object({ rating: z.string().min(1), count: z.number().int().min(0) })).min(1),
  target: z
    .array(
      z.object({
        rating: z.string().min(1),
        expectedShare: z.number().min(0).max(1),
        toleranceAbs: z.number().min(0).max(1).optional(),
      })
    )
    .min(1),
  perManager: z
    .array(
      z.object({
        managerId: z.string().min(1),
        distribution: z.array(
          z.object({ rating: z.string().min(1), count: z.number().int().min(0) })
        ),
      })
    )
    .optional(),
});

const calibSchema = z.object({
  action: z.literal('calibrationEvidence'),
  cycleStartDate: z.string(),
  cycleEndDate: z.string(),
  requiredByDays: z.number().int().min(0),
  evidence: z
    .object({
      cycleId: z.string().min(1),
      meetingAt: z.string(),
      minuteRef: z.string().optional(),
      attendees: z.array(
        z.object({
          userId: z.string().min(1),
          role: z.enum(['HR_OBSERVER', 'PANEL', 'SPONSOR']),
        })
      ),
      distributionReviewed: z.boolean(),
    })
    .optional(),
  asOf: z.string().optional(),
});

const ratingSchema = z.object({
  action: z.literal('resolveRating'),
  code: z.string().min(1).optional(),
});

const inputSchema = z.discriminatedUnion('action', [distSchema, calibSchema, ratingSchema]);

export const POST = withEnhancedAuth(async (req: NextRequest, ctx: RouteContext) => {
  if (!hasAny(ctx.permissions, 'performance:read', 'performance:manage', 'dashboard:read')) {
    return forbidden();
  }
  try {
    const raw = await req.json();
    const parsed = inputSchema.safeParse(raw);
    if (!parsed.success) return badRequest('Invalid input', { issues: parsed.error.flatten() });
    const body = parsed.data;
    if (body.action === 'forcedDistribution') {
      const verdict = detectForcedDistribution({
        observed: body.observed,
        target: body.target,
        perManager: body.perManager,
      });
      return ok({ verdict });
    }
    if (body.action === 'calibrationEvidence') {
      const verdict = checkCalibrationEvidence({
        cycleStartDate: new Date(body.cycleStartDate),
        cycleEndDate: new Date(body.cycleEndDate),
        requiredByDays: body.requiredByDays,
        asOf: body.asOf ? new Date(body.asOf) : undefined,
        evidence: body.evidence
          ? {
              cycleId: body.evidence.cycleId,
              meetingAt: new Date(body.evidence.meetingAt),
              minuteRef: body.evidence.minuteRef,
              attendees: body.evidence.attendees,
              distributionReviewed: body.evidence.distributionReviewed,
            }
          : undefined,
      });
      return ok({ verdict });
    }
    if (body.code) {
      const def = resolveRating(body.code);
      return ok({ definition: def });
    }
    return ok({ dictionary: DEFAULT_RATING_DICTIONARY });
  } catch (err) {
    return serverError('Failed to evaluate performance compliance check', err);
  }
});
